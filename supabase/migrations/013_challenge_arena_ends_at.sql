-- Arena lifecycle: approved UGC challenges can be closed (no new era end date enforced in app yet).
-- ends_at NULL = still open in Arena; ends_at <= now() = done / closed.

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.challenges.ends_at IS
  'When set, challenge is closed in Arena (done). NULL = open-ended (live). Only meaningful for approved UGC.';

CREATE INDEX IF NOT EXISTS idx_challenges_arena_open
  ON public.challenges (reviewed_at DESC NULLS LAST, created_at DESC)
  WHERE status = 'approved' AND is_official = FALSE AND ends_at IS NULL;

CREATE OR REPLACE FUNCTION public.admin_close_challenge(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  UPDATE public.challenges
  SET ends_at = NOW()
  WHERE id = p_challenge_id
    AND status = 'approved'
    AND is_official = FALSE
    AND (ends_at IS NULL OR ends_at > NOW());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'challenge_not_closable';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.admin_close_challenge IS
  'Admin only: close an approved community challenge (sets ends_at = now).';

REVOKE ALL ON FUNCTION public.admin_close_challenge(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_close_challenge(uuid) TO authenticated;
