import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: 'payg' | 'starter' }

    if (!['payg', 'starter'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const admin = await createSupabaseAdmin()
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await admin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const origin = request.headers.get('origin') || 'https://erocase-proggis.vercel.app'

    let lineItems: { price: string; quantity?: number }[]

    if (plan === 'payg') {
      lineItems = [{ price: process.env.STRIPE_PRICE_PAYG_MINUTE! }]
    } else {
      lineItems = [
        { price: process.env.STRIPE_PRICE_STARTER_BASE!, quantity: 1 },
        { price: process.env.STRIPE_PRICE_STARTER_OVERAGE! },
      ]
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${origin}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
