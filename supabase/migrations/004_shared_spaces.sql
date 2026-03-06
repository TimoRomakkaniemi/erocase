-- Shared spaces (1+1 model: max 1 partner + 1 friend per user)
CREATE TABLE IF NOT EXISTS shared_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('partner','friend')),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','archived')),
  invite_token UUID DEFAULT gen_random_uuid(),
  invite_expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Members (max 2 per space, enforced at app level)
CREATE TABLE IF NOT EXISTS shared_space_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES shared_spaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('creator','member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(space_id, user_id)
);

-- Shared tasks
CREATE TABLE IF NOT EXISTS shared_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES shared_spaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','completed')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins (0-10 score + 1 word)
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES shared_spaces(id),
  score INT NOT NULL CHECK (score >= 0 AND score <= 10),
  word TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Joint summaries (neutral AI-generated)
CREATE TABLE IF NOT EXISTS joint_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID REFERENCES shared_spaces(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  generation_mode TEXT CHECK (generation_mode IN ('auto','consent')),
  consent_a BOOLEAN DEFAULT false,
  consent_b BOOLEAN DEFAULT false,
  revoked_by UUID REFERENCES profiles(id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Share Cards (journal -> safe card for partner/friend)
CREATE TABLE IF NOT EXISTS share_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES shared_spaces(id) ON DELETE CASCADE,
  source_journal_id UUID REFERENCES journal_entries(id),
  original_content TEXT NOT NULL,
  safe_content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft','sent','viewed','replied')),
  reply_conversation_id UUID REFERENCES conversations(id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add shared_to_space FK now that shared_spaces exists
ALTER TABLE today_sessions
  ADD CONSTRAINT fk_today_shared_space
  FOREIGN KEY (shared_to_space) REFERENCES shared_spaces(id);

-- RLS for all shared tables
ALTER TABLE shared_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;

-- Shared spaces: visible to members only
CREATE POLICY "Members can view own spaces"
  ON shared_spaces FOR SELECT
  USING (id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create spaces"
  ON shared_spaces FOR INSERT
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creator can update space"
  ON shared_spaces FOR UPDATE
  USING (created_by = auth.uid());

-- Space members
CREATE POLICY "Members can view space members"
  ON shared_space_members FOR SELECT
  USING (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can join spaces"
  ON shared_space_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Shared tasks: visible to space members
CREATE POLICY "Members can view space tasks"
  ON shared_tasks FOR SELECT
  USING (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can create tasks"
  ON shared_tasks FOR INSERT
  WITH CHECK (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can update tasks"
  ON shared_tasks FOR UPDATE
  USING (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));

-- Check-ins: own + shared visible to space members
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (user_id = auth.uid() OR (is_shared AND space_id IN (
    SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()
  )));
CREATE POLICY "Users can create check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own check-ins"
  ON check_ins FOR UPDATE
  USING (user_id = auth.uid());

-- Joint summaries: visible to space members
CREATE POLICY "Members can view summaries"
  ON joint_summaries FOR SELECT
  USING (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can create summaries"
  ON joint_summaries FOR INSERT
  WITH CHECK (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can update summaries"
  ON joint_summaries FOR UPDATE
  USING (space_id IN (SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()));

-- Share cards: sender and space members can view
CREATE POLICY "Users can view received/sent cards"
  ON share_cards FOR SELECT
  USING (sender_id = auth.uid() OR space_id IN (
    SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Users can create cards"
  ON share_cards FOR INSERT
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Sender can update own cards"
  ON share_cards FOR UPDATE
  USING (sender_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shared_spaces_created_by ON shared_spaces(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_spaces_invite_token ON shared_spaces(invite_token);
CREATE INDEX IF NOT EXISTS idx_space_members_user ON shared_space_members(user_id);
CREATE INDEX IF NOT EXISTS idx_space_members_space ON shared_space_members(space_id);
CREATE INDEX IF NOT EXISTS idx_shared_tasks_space ON shared_tasks(space_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_space ON check_ins(space_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(created_at);
CREATE INDEX IF NOT EXISTS idx_joint_summaries_space ON joint_summaries(space_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_space ON share_cards(space_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_sender ON share_cards(sender_id);
