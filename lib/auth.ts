import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

export interface AuthResult {
  user: { id: string; email: string }
  profile: {
    id: string
    email: string
    role: string
    plan: string
    plan_status: string
    display_name: string | null
    disabled: boolean
    [key: string]: unknown
  }
  isAdmin: boolean
}

export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createSupabaseServer()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AuthError('Unauthorized', 401)
  }

  const admin = await createSupabaseAdmin()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new AuthError('Profile not found', 404)
  }

  if (profile.disabled) {
    throw new AuthError('Account disabled', 403)
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'superadmin'

  return {
    user: { id: user.id, email: user.email || profile.email },
    profile,
    isAdmin,
  }
}

export async function requireAdmin(): Promise<AuthResult> {
  const result = await requireAuth()

  if (!result.isAdmin) {
    throw new AuthError('Forbidden', 403)
  }

  return result
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export function handleAuthError(err: unknown) {
  if (err instanceof AuthError) {
    return Response.json({ error: err.message }, { status: err.status })
  }
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
