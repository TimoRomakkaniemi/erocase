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

    const admin = await createSupabaseAdmin()
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      )
    }

    const origin = request.headers.get('origin') || 'https://erocase-proggis.vercel.app'

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Portal error:', err)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
