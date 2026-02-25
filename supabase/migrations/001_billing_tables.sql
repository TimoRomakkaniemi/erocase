-- User profile with Stripe link
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  plan_status TEXT DEFAULT 'inactive',
  included_minutes_remaining INT DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Per-billing-period AI cost ledger
CREATE TABLE IF NOT EXISTS ai_usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  tokens_in BIGINT DEFAULT 0,
  tokens_out BIGINT DEFAULT 0,
  estimated_cost_eur NUMERIC(10,4) DEFAULT 0,
  budget_eur NUMERIC(10,4) NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Per-session tracking
CREATE TABLE IF NOT EXISTS ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  billable_minutes NUMERIC(10,2) DEFAULT 0,
  tokens_in BIGINT DEFAULT 0,
  tokens_out BIGINT DEFAULT 0,
  estimated_cost_eur NUMERIC(10,4) DEFAULT 0,
  budget_eur NUMERIC(10,4) DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add user_id to existing conversations table (nullable for backwards compat)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own row
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- AI Usage Ledger: users can read their own entries
CREATE POLICY "Users can view own ledger"
  ON ai_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ledger"
  ON ai_usage_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ledger"
  ON ai_usage_ledger FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Sessions: users can read/write their own sessions
CREATE POLICY "Users can view own sessions"
  ON ai_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON ai_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON ai_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
