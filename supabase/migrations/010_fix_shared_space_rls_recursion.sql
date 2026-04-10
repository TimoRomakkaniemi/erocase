-- RLS on shared_space_members used "SELECT ... FROM shared_space_members" inside policies
-- on the same table, causing infinite recursion. Use a SECURITY DEFINER helper so membership
-- checks bypass RLS on that read.

CREATE OR REPLACE FUNCTION public.user_is_space_member(p_space_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.shared_space_members m
    WHERE m.space_id = p_space_id
      AND m.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.user_is_space_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_is_space_member(uuid) TO authenticated;

-- shared_spaces (creator must see row on INSERT ... RETURNING before member row exists)
DROP POLICY IF EXISTS "Members can view own spaces" ON shared_spaces;
CREATE POLICY "Members can view own spaces"
  ON shared_spaces FOR SELECT
  USING (
    public.user_is_space_member(id)
    OR created_by = auth.uid()
  );

-- shared_space_members
DROP POLICY IF EXISTS "Members can view space members" ON shared_space_members;
CREATE POLICY "Members can view space members"
  ON shared_space_members FOR SELECT
  USING (public.user_is_space_member(space_id));

-- shared_tasks
DROP POLICY IF EXISTS "Members can view space tasks" ON shared_tasks;
CREATE POLICY "Members can view space tasks"
  ON shared_tasks FOR SELECT
  USING (public.user_is_space_member(space_id));

DROP POLICY IF EXISTS "Members can create tasks" ON shared_tasks;
CREATE POLICY "Members can create tasks"
  ON shared_tasks FOR INSERT
  WITH CHECK (public.user_is_space_member(space_id));

DROP POLICY IF EXISTS "Members can update tasks" ON shared_tasks;
CREATE POLICY "Members can update tasks"
  ON shared_tasks FOR UPDATE
  USING (public.user_is_space_member(space_id));

-- check_ins
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      is_shared
      AND space_id IS NOT NULL
      AND public.user_is_space_member(space_id)
    )
  );

-- joint_summaries
DROP POLICY IF EXISTS "Members can view summaries" ON joint_summaries;
CREATE POLICY "Members can view summaries"
  ON joint_summaries FOR SELECT
  USING (public.user_is_space_member(space_id));

DROP POLICY IF EXISTS "Members can create summaries" ON joint_summaries;
CREATE POLICY "Members can create summaries"
  ON joint_summaries FOR INSERT
  WITH CHECK (public.user_is_space_member(space_id));

DROP POLICY IF EXISTS "Members can update summaries" ON joint_summaries;
CREATE POLICY "Members can update summaries"
  ON joint_summaries FOR UPDATE
  USING (public.user_is_space_member(space_id));

-- share_cards
DROP POLICY IF EXISTS "Users can view received/sent cards" ON share_cards;
CREATE POLICY "Users can view received/sent cards"
  ON share_cards FOR SELECT
  USING (
    sender_id = auth.uid()
    OR (space_id IS NOT NULL AND public.user_is_space_member(space_id))
  );

-- space_consents (007)
DROP POLICY IF EXISTS "Members can view space consents" ON space_consents;
CREATE POLICY "Members can view space consents"
  ON space_consents FOR SELECT
  USING (public.user_is_space_member(space_id));
