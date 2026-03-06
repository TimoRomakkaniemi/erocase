import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { card_id: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { card_id } = body
  if (!card_id) {
    return NextResponse.json({ error: 'card_id is required' }, { status: 400 })
  }

  const { data: card, error: fetchError } = await supabase
    .from('share_cards')
    .select('sender_id, revoked_at')
    .eq('id', card_id)
    .single()

  if (fetchError || !card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.sender_id !== user.id) {
    return NextResponse.json({ error: 'Only the sender can revoke this card' }, { status: 403 })
  }

  if (card.revoked_at) {
    return NextResponse.json({ error: 'Card already revoked' }, { status: 400 })
  }

  const { error } = await supabase
    .from('share_cards')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', card_id)
    .eq('sender_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
