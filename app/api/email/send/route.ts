import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { sendMail } from '@/lib/sendgrid'

/**
 * POST /api/email/send
 * Sends email via SendGrid (Trusty-style: SENDGRID_API_KEY + SENDER_EMAIL).
 *
 * Auth (either):
 * - Header Authorization: Bearer EMAIL_INTERNAL_SECRET — any recipient (cron / scripts).
 * - Logged-in user — only if body.to matches their email (safe self-send).
 */
export async function POST(request: NextRequest) {
  const internalSecret = process.env.EMAIL_INTERNAL_SECRET?.trim()
  const authHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''

  let allowAnyRecipient = Boolean(internalSecret && authHeader === internalSecret)

  if (!allowAnyRecipient) {
    const supabase = await createSupabaseServer()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { to?: string; subject?: string; text?: string; html?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : ''
    if (!to || to !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'You may only send to your own email without EMAIL_INTERNAL_SECRET' },
        { status: 403 }
      )
    }

    if (!body.subject?.trim()) {
      return NextResponse.json({ error: 'subject required' }, { status: 400 })
    }

    const result = await sendMail({
      to,
      subject: body.subject.trim(),
      text: body.text,
      html: body.html,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }
    return NextResponse.json({ ok: true, messageId: result.messageId })
  }

  let body: { to?: string | string[]; subject?: string; text?: string; html?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.subject?.trim()) {
    return NextResponse.json({ error: 'subject required' }, { status: 400 })
  }
  if (!body.to) {
    return NextResponse.json({ error: 'to required' }, { status: 400 })
  }

  const result = await sendMail({
    to: body.to,
    subject: body.subject.trim(),
    text: body.text,
    html: body.html,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, messageId: result.messageId })
}
