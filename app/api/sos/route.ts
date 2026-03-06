import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      mode: string
      steps_completed: number
      total_steps: number
      relief_rating: number | null
      duration_seconds: number
      outcome: 'completed' | 'abandoned' | 'escalated_to_chat'
    }

    const { mode, steps_completed, total_steps, relief_rating, duration_seconds, outcome } = body

    if (!mode || typeof steps_completed !== 'number' || typeof total_steps !== 'number') {
      return NextResponse.json(
        { error: 'mode, steps_completed, total_steps required' },
        { status: 400 }
      )
    }

    const validOutcomes = ['completed', 'abandoned', 'escalated_to_chat']
    if (!outcome || !validOutcomes.includes(outcome)) {
      return NextResponse.json(
        { error: 'outcome must be completed, abandoned, or escalated_to_chat' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sos_sessions')
      .insert({
        user_id: user.id,
        mode,
        steps_completed,
        total_steps: total_steps,
        relief_rating: relief_rating != null && relief_rating >= 0 && relief_rating <= 10
          ? relief_rating
          : null,
        duration_seconds: duration_seconds >= 0 ? duration_seconds : null,
        outcome,
      })
      .select('id')
      .single()

    if (error) {
      console.error('SOS insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save SOS session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('SOS API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
