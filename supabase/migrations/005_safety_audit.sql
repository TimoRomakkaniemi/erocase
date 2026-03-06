-- Triage records (safety screening)
CREATE TABLE IF NOT EXISTS triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('self_harm','dv','crisis','high_intensity')),
  intensity_score INT CHECK (intensity_score >= 0 AND intensity_score <= 10),
  action_taken TEXT CHECK (action_taken IN ('crisis_resources','safe_exit','dv_lock','professional_referral')),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DV locks (blocks shared space interactions for safety)
CREATE TABLE IF NOT EXISTS dv_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  space_id UUID REFERENCES shared_spaces(id),
  is_active BOOLEAN DEFAULT true,
  locked_at TIMESTAMPTZ DEFAULT now(),
  unlocked_at TIMESTAMPTZ
);

-- Audit trail (all share/view/revoke/export/delete actions)
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('share','view','revoke','export','delete','consent','dv_lock','dv_unlock')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('share_card','check_in','joint_summary','journal','task','profile','conversation','space')),
  resource_id UUID,
  target_user_id UUID REFERENCES profiles(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE triage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE dv_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own triage records"
  ON triage_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own triage records"
  ON triage_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own triage records"
  ON triage_records FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own DV locks"
  ON dv_locks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own DV locks"
  ON dv_locks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own DV locks"
  ON dv_locks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own audit trail"
  ON audit_trail FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit entries"
  ON audit_trail FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_triage_user ON triage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_triage_type ON triage_records(trigger_type);
CREATE INDEX IF NOT EXISTS idx_dv_locks_user ON dv_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_dv_locks_active ON dv_locks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_trail(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
