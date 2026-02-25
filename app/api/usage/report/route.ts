import { NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session_id } = await request.json() as { session_id: string }

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    }

    const admin = await createSupabaseAdmin()

    const { data: session } = await admin
      .from('ai_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status === 'ENDED') {
      return NextResponse.json({ message: 'Session already ended' })
    }

    const endedAt = new Date()
    const startedAt = new Date(session.started_at)
    const durationMs = endedAt.getTime() - startedAt.getTime()
    const billableMinutes = Math.max(1, Math.ceil(durationMs / 60000))

    await admin
      .from('ai_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        billable_minutes: billableMinutes,
        status: 'ENDED',
      })
      .eq('id', session_id)

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id && profile?.plan !== 'free') {
      const meterEventName = process.env.STRIPE_METER_EVENT_NAME || 'solvia_usage_minutes'

      try {
        await stripe.billing.meterEvents.create({
          event_name: meterEventName,
          payload: {
            stripe_customer_id: profile.stripe_customer_id,
            value: String(billableMinutes),
          },
          identifier: session_id,
          timestamp: Math.floor(endedAt.getTime() / 1000),
        })
      } catch (meterErr) {
        console.error('Stripe meter event error:', meterErr)
      }
    }

    if (profile?.plan === 'starter') {
      const { data: currentProfile } = await admin
        .from('profiles')
        .select('included_minutes_remaining')
        .eq('id', user.id)
        .single()

      if (currentProfile) {
        const remaining = Math.max(0, (currentProfile.included_minutes_remaining || 0) - billableMinutes)
        await admin
          .from('profiles')
          .update({ included_minutes_remaining: remaining })
          .eq('id', user.id)
      }
    }

    return NextResponse.json({
      session_id,
      billable_minutes: billableMinutes,
      status: 'ENDED',
    })
  } catch (err) {
    console.error('Usage report error:', err)
    return NextResponse.json(
      { error: 'Failed to report usage' },
      { status: 500 }
    )
  }
}
