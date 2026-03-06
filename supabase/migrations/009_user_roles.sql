-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
-- role: 'user' | 'admin' | 'superadmin'

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add disabled flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;

-- Seed first superadmin
UPDATE profiles SET role = 'superadmin'
WHERE email = 'timo@demo.solvia.fi';

-- System settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

INSERT INTO system_settings (key, value) VALUES
  ('free_daily_messages', '3'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('feature_flags', '{"sos": true, "today": true, "journal": true, "shared_space": true, "voice": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS for system_settings: only admins can read/write
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can insert settings"
  ON system_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );
