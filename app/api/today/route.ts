import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start') // ISO string, start of user's local today
    const end = searchParams.get('end') // ISO string, end of user's local today

    if (!start || !end) {
      return NextResponse.json(
        { error: 'start and end query params required (ISO 8601)' },
        { status: 400 }
      )
    }

    const startOfDay = new Date(start).toISOString()
    const endOfDay = new Date(end).toISOString()

    const { data, error } = await supabase
      .from('today_sessions')
      .select('id, mode, check_in_score, check_in_word, exercise_id, action_text, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Today sessions fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch today session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      doneToday: !!data,
      session: data ?? null,
    })
  } catch (err) {
    console.error('Today API GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as {
      mode: string
      check_in_score: number | null
      check_in_word: string | null
      exercise_id: string | null
      exercise_completed: boolean
      action_text: string | null
      action_completed: boolean
    }

    const {
      mode,
      check_in_score,
      check_in_word,
      exercise_id,
      exercise_completed,
      action_text,
      action_completed,
    } = body

    if (!mode) {
      return NextResponse.json(
        { error: 'mode required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('today_sessions')
      .insert({
        user_id: user.id,
        mode,
        check_in_score:
          check_in_score != null && check_in_score >= 0 && check_in_score <= 10
            ? check_in_score
            : null,
        check_in_word: check_in_word || null,
        exercise_id: exercise_id || null,
        exercise_completed: !!exercise_completed,
        action_text: action_text || null,
        action_completed: !!action_completed,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Today session insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save today session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('Today API POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
