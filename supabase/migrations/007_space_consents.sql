-- Per-space consent preferences (share check-ins, allow joint summary)
CREATE TABLE IF NOT EXISTS space_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES shared_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  share_checkins BOOLEAN DEFAULT true,
  allow_joint_summary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(space_id, user_id)
);

ALTER TABLE space_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view space consents"
  ON space_consents FOR SELECT
  USING (space_id IN (
    SELECT space_id FROM shared_space_members WHERE user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own consents"
  ON space_consents FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own consents"
  ON space_consents FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_space_consents_user ON space_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_space_consents_space ON space_consents(space_id);
