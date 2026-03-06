-- SOS session tracking
CREATE TABLE IF NOT EXISTS sos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  steps_completed INT DEFAULT 0,
  total_steps INT NOT NULL,
  relief_rating INT CHECK (relief_rating >= 0 AND relief_rating <= 10),
  duration_seconds INT,
  outcome TEXT CHECK (outcome IN ('completed','abandoned','escalated_to_chat')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Today loop sessions
CREATE TABLE IF NOT EXISTS today_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  check_in_score INT CHECK (check_in_score >= 0 AND check_in_score <= 10),
  check_in_word TEXT,
  exercise_id TEXT,
  exercise_completed BOOLEAN DEFAULT false,
  action_text TEXT,
  action_completed BOOLEAN DEFAULT false,
  shared_to_space UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Private journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  mood_score INT CHECK (mood_score >= 0 AND mood_score <= 10),
  mode TEXT,
  auto_delete_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE sos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE today_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own SOS sessions"
  ON sos_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own SOS sessions"
  ON sos_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own SOS sessions"
  ON sos_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own today sessions"
  ON today_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own today sessions"
  ON today_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own today sessions"
  ON today_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sos_sessions_user_id ON sos_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_today_sessions_user_id ON today_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_today_sessions_created_at ON today_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_auto_delete ON journal_entries(auto_delete_at) WHERE auto_delete_at IS NOT NULL;
