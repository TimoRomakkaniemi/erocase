/**
 * Map Supabase Auth errors to user-facing copy (keys resolved via useT / t()).
 */

type TFn = (key: string) => string

function rawMessage(err: unknown): string {
  if (!err || typeof err !== 'object') return ''
  const m = (err as { message?: unknown }).message
  return typeof m === 'string' ? m : ''
}

function rawCode(err: unknown): string {
  if (!err || typeof err !== 'object') return ''
  const c = (err as { code?: unknown }).code
  return typeof c === 'string' ? c : ''
}

export function translateSupabaseAuthError(err: unknown, t: TFn): string {
  const msg = rawMessage(err)
  const code = rawCode(err)
  const hay = `${msg} ${code}`.toLowerCase()

  if (hay.includes('email_not_confirmed') || hay.includes('email not confirmed')) {
    return t('auth.errorEmailNotConfirmed')
  }
  if (msg === 'Invalid login credentials' || hay.includes('invalid login credentials')) {
    return t('auth.errorInvalidCredentials')
  }
  if (
    hay.includes('already registered') ||
    hay.includes('user already exists') ||
    hay.includes('already been registered') ||
    code === 'user_already_exists'
  ) {
    return t('auth.errorUserAlreadyExists')
  }
  if (hay.includes('signups not allowed') || hay.includes('signup_disabled')) {
    return t('auth.errorSignupsDisabled')
  }
  if (hay.includes('rate limit') || hay.includes('too many requests') || hay.includes('over_email_send_rate_limit')) {
    return t('auth.errorRateLimit')
  }
  if (msg.trim()) return msg
  return t('auth.errorGeneric')
}
