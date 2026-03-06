-- User-selected modes
CREATE TABLE IF NOT EXISTS user_modes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('conflict','breakup','loneliness','calm')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mode)
);

-- User personalization preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  guidance_style TEXT DEFAULT 'balanced' CHECK (guidance_style IN ('structured','balanced','open')),
  tone TEXT DEFAULT 'gentle' CHECK (tone IN ('gentle','direct','light_humor')),
  voice_enabled BOOLEAN DEFAULT false,
  avatar TEXT DEFAULT 'default',
  auto_delete_days INT DEFAULT 0 CHECK (auto_delete_days IN (0, 90, 180, 365)),
  onboarding_variant TEXT CHECK (onboarding_variant IN ('A','B')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extend profiles with display name and country
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'FI';

-- Add mode to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS mode TEXT;

-- RLS for user_modes
ALTER TABLE user_modes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own modes"
  ON user_modes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own modes"
  ON user_modes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own modes"
  ON user_modes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own modes"
  ON user_modes FOR DELETE USING (auth.uid() = user_id);

-- RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create preferences on profile creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_preferences ON profiles;
CREATE TRIGGER on_profile_created_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_preferences();

CREATE INDEX IF NOT EXISTS idx_user_modes_user_id ON user_modes(user_id);
