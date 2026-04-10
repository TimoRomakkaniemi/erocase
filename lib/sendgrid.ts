/**
 * SendGrid transactional mail (same env pattern as Trusty Finance / Trusty_uusi).
 * Env: SENDGRID_API_KEY, and SENDER_EMAIL or SENDGRID_FROM_EMAIL (verified sender in SendGrid).
 */
import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY

if (apiKey) {
  sgMail.setApiKey(apiKey)
}

export function isSendGridConfigured(): boolean {
  return Boolean(apiKey?.trim())
}

/** Default From — Trusty uses SENDER_EMAIL; SENDGRID_FROM_EMAIL is an alias. */
export function getSendGridFrom(): string {
  return (
    process.env.SENDGRID_FROM_EMAIL?.trim() ||
    process.env.SENDER_EMAIL?.trim() ||
    ''
  )
}

export type SendMailOptions = {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  from?: string
  replyTo?: string
}

export type SendMailResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string }

/**
 * Send a single message via SendGrid. No-op style errors if not configured.
 */
export async function sendMail(options: SendMailOptions): Promise<SendMailResult> {
  if (!isSendGridConfigured()) {
    console.warn('[sendgrid] SENDGRID_API_KEY missing, skip send')
    return { ok: false, error: 'SendGrid not configured' }
  }

  const from = options.from?.trim() || getSendGridFrom()
  if (!from) {
    console.warn('[sendgrid] SENDER_EMAIL or SENDGRID_FROM_EMAIL missing')
    return { ok: false, error: 'Missing sender (SENDER_EMAIL or SENDGRID_FROM_EMAIL)' }
  }

  const hasBody = Boolean(options.text?.trim() || options.html?.trim())
  if (!hasBody) {
    return { ok: false, error: 'Provide text or html' }
  }

  const text = options.text?.trim()
  const html = options.html?.trim()

  try {
    const common = {
      to: options.to,
      from,
      subject: options.subject,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    }
    const [res] = await sgMail.send(
      html
        ? { ...common, html, ...(text ? { text } : {}) }
        : { ...common, text: text! }
    )

    const messageId =
      typeof res.headers['x-message-id'] === 'string' ? res.headers['x-message-id'] : undefined
    return { ok: true, messageId }
  } catch (e: unknown) {
    const err = e as { response?: { body?: unknown } }
    const detail = err.response?.body != null ? JSON.stringify(err.response.body) : String(e)
    console.error('[sendgrid] send failed:', detail)
    return { ok: false, error: detail }
  }
}
