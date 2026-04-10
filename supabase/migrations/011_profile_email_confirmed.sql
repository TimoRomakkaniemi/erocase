-- Mirror auth.users email confirmation into public.profiles for SQL/admin visibility.
-- Canonical state remains auth.users (Supabase Auth); this column is a convenience copy.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.email_confirmed_at IS
  'Copy of auth.users.email_confirmed_at; updated on signup and when user confirms email.';

-- New users: include confirmation timestamp (NULL until user confirms, if Confirm email is enabled).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, email_confirmed_at)
  VALUES (new.id, new.email, new.email_confirmed_at)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- When user confirms email (or email changes), keep profiles in sync.
CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = new.email,
    email_confirmed_at = new.email_confirmed_at,
    updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (
    old.email IS DISTINCT FROM new.email
    OR old.email_confirmed_at IS DISTINCT FROM new.email_confirmed_at
  )
  EXECUTE FUNCTION public.sync_profile_from_auth_user();

-- Backfill existing rows
UPDATE public.profiles p
SET
  email_confirmed_at = u.email_confirmed_at,
  email = COALESCE(NULLIF(trim(p.email), ''), u.email),
  updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND (
    p.email_confirmed_at IS DISTINCT FROM u.email_confirmed_at
    OR (p.email IS DISTINCT FROM u.email AND u.email IS NOT NULL)
  );
