import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { trackEventServer } from '@/lib/analytics-server'

export async function GET() {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const exportData: Record<string, unknown> = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    profile: null,
    preferences: null,
    modes: [],
    conversations: [],
    messages: [],
    journal_entries: [],
    sos_sessions: [],
    today_sessions: [],
    check_ins: [],
    share_cards: [],
    audit_trail: [],
  }

  const [profileRes, prefsRes, modesRes, convRes, journalRes, sosRes, todayRes, checkinsRes, cardsRes, auditRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
    supabase.from('user_modes').select('*').eq('user_id', user.id).eq('is_active', true),
    supabase.from('conversations').select('id, title, mood, mode, created_at, updated_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('sos_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('today_sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('check_ins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('share_cards').select('*').eq('sender_id', user.id).order('created_at', { ascending: false }),
    supabase.from('audit_trail').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  exportData.profile = profileRes.data
  exportData.preferences = prefsRes.data
  exportData.modes = modesRes.data ?? []
  exportData.journal_entries = journalRes.data ?? []
  exportData.sos_sessions = sosRes.data ?? []
  exportData.today_sessions = todayRes.data ?? []
  exportData.check_ins = checkinsRes.data ?? []
  exportData.share_cards = cardsRes.data ?? []
  exportData.audit_trail = auditRes.data ?? []

  const convIds = (convRes.data ?? []).map((c: { id: string }) => c.id)
  exportData.conversations = convRes.data ?? []

  if (convIds.length > 0) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true })
    exportData.messages = msgs ?? []
  }

  trackEventServer(user.id, 'data_exported').catch(() => {})

  const filename = `solvia-export-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`
  const json = JSON.stringify(exportData, null, 2)

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
