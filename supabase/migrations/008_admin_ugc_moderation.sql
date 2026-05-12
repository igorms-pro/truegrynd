-- Admin UGC: app moderators (profiles.is_app_admin) approve/reject pending challenges.
-- RPCs use SECURITY DEFINER; secrets never in client — only JWT auth.uid().

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.is_admin IS 'When true, user may run admin RPCs (challenge moderation). Set manually in prod.';

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.challenges.rejection_reason IS 'Shown to creator when status = rejected.';
COMMENT ON COLUMN public.challenges.reviewed_at IS 'When an admin last changed status from pending.';
COMMENT ON COLUMN public.challenges.reviewed_by IS 'Admin profile id who reviewed.';

CREATE INDEX IF NOT EXISTS idx_challenges_pending_created ON public.challenges(status, created_at DESC)
  WHERE status = 'pending';

-- True when the current JWT is an app admin (reads profiles; bypasses RLS via SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_admin IS TRUE
  );
$$;

COMMENT ON FUNCTION public.is_app_admin IS 'True if auth.uid() has profiles.is_admin = true.';

DROP POLICY IF EXISTS "Creators can update own pending challenge" ON public.challenges;

CREATE POLICY "Creators can update own pending challenge"
  ON public.challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id AND status = 'pending')
  WITH CHECK (
    auth.uid() = creator_id
    AND status = 'pending'
    AND is_official = false
    AND rejection_reason IS NULL
    AND reviewed_at IS NULL
    AND reviewed_by IS NULL
  );

CREATE POLICY "App admins can read all challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (public.is_app_admin());

CREATE OR REPLACE FUNCTION public.admin_set_challenge_status(
  p_challenge_id uuid,
  p_status text,
  p_rejection_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trimmed_reason text;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  trimmed_reason := NULLIF(trim(p_rejection_reason), '');

  IF p_status = 'rejected' THEN
    IF trimmed_reason IS NULL OR length(trimmed_reason) < 10 THEN
      RAISE EXCEPTION 'rejection_reason_required';
    END IF;
  END IF;

  IF p_status = 'approved' THEN
    trimmed_reason := NULL;
  END IF;

  UPDATE public.challenges
  SET
    status = p_status,
    rejection_reason = trimmed_reason,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = p_challenge_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'challenge_not_pending';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.admin_set_challenge_status IS 'Admin only: pending -> approved/rejected with audit fields.';

CREATE OR REPLACE FUNCTION public.admin_batch_approve_challenges(p_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_ids IS NULL OR cardinality(p_ids) = 0 THEN
    RETURN 0;
  END IF;

  IF cardinality(p_ids) > 50 THEN
    RAISE EXCEPTION 'batch_limit_exceeded';
  END IF;

  UPDATE public.challenges
  SET
    status = 'approved',
    rejection_reason = NULL,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = ANY (p_ids)
    AND status = 'pending';

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

COMMENT ON FUNCTION public.admin_batch_approve_challenges IS 'Admin only: approve up to 50 pending challenges in one call.';

REVOKE ALL ON FUNCTION public.is_app_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_challenge_status(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_batch_approve_challenges(uuid[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_app_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_challenge_status(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_batch_approve_challenges(uuid[]) TO authenticated;
