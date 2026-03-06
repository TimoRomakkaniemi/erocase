-- Couple plan: partner linking and daily free message tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linked_partner_id UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_messages_used INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_messages_reset_at TIMESTAMPTZ;

-- Index for partner lookup
CREATE INDEX IF NOT EXISTS idx_profiles_linked_partner ON profiles(linked_partner_id);
