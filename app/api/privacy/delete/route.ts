import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

const CONFIRM_STRING = 'DELETE_ALL_MY_DATA'

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { confirm?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body.confirm !== CONFIRM_STRING) {
    return NextResponse.json(
      { error: 'Confirmation string required. Send { confirm: "DELETE_ALL_MY_DATA" }' },
      { status: 400 }
    )
  }

  const userId = user.id

  const admin = await createSupabaseAdmin()

  const { data: convs } = await admin.from('conversations').select('id').eq('user_id', userId)
  const convIds = (convs ?? []).map((c: { id: string }) => c.id)

  if (convIds.length > 0) {
    await admin.from('messages').delete().in('conversation_id', convIds)
  }
  await admin.from('conversations').delete().eq('user_id', userId)

  await admin.from('journal_entries').delete().eq('user_id', userId)

  const { data: sentCards } = await admin.from('share_cards').select('id').eq('sender_id', userId)
  const cardIds = (sentCards ?? []).map((c: { id: string }) => c.id)
  if (cardIds.length > 0) {
    await admin.from('share_cards').update({ revoked_at: new Date().toISOString() }).in('id', cardIds)
  }

  await admin.from('ai_sessions').delete().eq('user_id', userId)
  await admin.from('ai_usage_ledger').delete().eq('user_id', userId)
  await admin.from('today_sessions').delete().eq('user_id', userId)
  await admin.from('sos_sessions').delete().eq('user_id', userId)
  await admin.from('check_ins').delete().eq('user_id', userId)
  await admin.from('user_modes').delete().eq('user_id', userId)
  await admin.from('user_preferences').delete().eq('user_id', userId)
  await admin.from('triage_records').delete().eq('user_id', userId)
  await admin.from('space_consents').delete().eq('user_id', userId)

  await admin.from('shared_space_members').delete().eq('user_id', userId)

  await admin.from('audit_trail').insert({
    user_id: userId,
    action: 'delete',
    resource_type: 'profile',
    metadata: { type: 'full_account_deletion', confirmed: true },
  })

  trackEventServer(userId, 'data_deleted').catch(() => {})

  return NextResponse.json({
    ok: true,
    message: 'All your data has been deleted. Profile retained for auth.',
  })
}
