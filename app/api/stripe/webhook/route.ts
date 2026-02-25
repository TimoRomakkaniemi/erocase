import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { computeSessionBudget } from '@/lib/budget'
import type Stripe from 'stripe'

function getSubscriptionPeriod(sub: Stripe.Subscription): { start: Date; end: Date } {
  const firstItem = sub.items?.data?.[0]
  if (firstItem) {
    return {
      start: new Date(firstItem.current_period_start * 1000),
      end: new Date(firstItem.current_period_end * 1000),
    }
  }
  return {
    start: new Date(sub.start_date * 1000),
    end: new Date((sub.start_date + 30 * 24 * 60 * 60) * 1000),
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = await createSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.subscription
          ? (await stripe.subscriptions.retrieve(session.subscription as string, { expand: ['items'] })).metadata.supabase_user_id
          : null

        if (userId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string, { expand: ['items'] })
          const plan = sub.metadata.plan || 'payg'
          const period = getSubscriptionPeriod(sub)

          await admin
            .from('profiles')
            .update({
              subscription_id: sub.id,
              plan,
              plan_status: 'active',
              included_minutes_remaining: plan === 'starter' ? 900 : 0,
              current_period_start: period.start.toISOString(),
              current_period_end: period.end.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          const budgetEur = computeSessionBudget(plan, plan === 'starter' ? 900 : 60)

          await admin.from('ai_usage_ledger').insert({
            user_id: userId,
            period_start: period.start.toISOString(),
            period_end: period.end.toISOString(),
            budget_eur: budgetEur,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.supabase_user_id
        if (!userId) break

        const plan = sub.metadata.plan || 'payg'
        const period = getSubscriptionPeriod(sub)

        await admin
          .from('profiles')
          .update({
            plan,
            plan_status: sub.status === 'active' ? 'active'
              : sub.status === 'past_due' ? 'past_due'
              : sub.status === 'canceled' ? 'canceled'
              : sub.status,
            included_minutes_remaining: plan === 'starter' ? 900 : 0,
            current_period_start: period.start.toISOString(),
            current_period_end: period.end.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata.supabase_user_id
        if (!userId) break

        await admin
          .from('profiles')
          .update({
            plan: 'free',
            plan_status: 'canceled',
            subscription_id: null,
            included_minutes_remaining: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.parent?.subscription_details?.subscription
        if (!subId) break

        const subIdStr = typeof subId === 'string' ? subId : subId.id
        const sub = await stripe.subscriptions.retrieve(subIdStr, { expand: ['items'] })
        const userId = sub.metadata.supabase_user_id
        if (!userId) break

        const plan = sub.metadata.plan || 'payg'
        const period = getSubscriptionPeriod(sub)
        const budgetEur = computeSessionBudget(plan, plan === 'starter' ? 900 : 60)

        await admin.from('ai_usage_ledger').upsert(
          {
            user_id: userId,
            period_start: period.start.toISOString(),
            period_end: period.end.toISOString(),
            budget_eur: budgetEur,
            tokens_in: 0,
            tokens_out: 0,
            estimated_cost_eur: 0,
            status: 'ACTIVE',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,period_start' }
        )

        if (plan === 'starter') {
          await admin
            .from('profiles')
            .update({ included_minutes_remaining: 900 })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.parent?.subscription_details?.subscription
        if (!subId) break

        const subIdStr = typeof subId === 'string' ? subId : subId.id
        const sub = await stripe.subscriptions.retrieve(subIdStr)
        const userId = sub.metadata.supabase_user_id
        if (!userId) break

        await admin
          .from('profiles')
          .update({
            plan_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
