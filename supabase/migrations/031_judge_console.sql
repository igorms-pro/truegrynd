-- V3-03: Judge Console backend.
-- A coach / gym_admin validates a score of a member affiliated to THEIR gym →
-- proof_level becomes 'judge_verified' (the top credibility tier) + the verifying
-- coach is recorded. Reuses the existing proof helpers (027). platform_admin oversees all.

-- 1. Allow 'judge' as a proof-audit source (existing CHECK had no coach source).
ALTER TABLE public.score_proof_audits DROP CONSTRAINT IF EXISTS score_proof_audits_source_check;
ALTER TABLE public.score_proof_audits
  ADD CONSTRAINT score_proof_audits_source_check
  CHECK (source IN ('system', 'admin', 'community_respects', 'event', 'judge'));

-- 2. Queue — scores from the caller's gym members still awaiting judge verification.
-- SECURITY DEFINER so a coach sees their members' pending scores regardless of per-row RLS.
CREATE OR REPLACE FUNCTION public.pending_verifications()
RETURNS TABLE (
  score_id            uuid,
  value               numeric,
  video_url           text,
  proof_level         public.proof_level,
  is_validated        boolean,
  submitted_at        timestamptz,
  athlete_id          uuid,
  athlete_username    text,
  athlete_division    text,
  athlete_faction     text,
  athlete_avatar_url  text,
  challenge_id        uuid,
  challenge_title     text,
  score_type          text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id, s.value, s.video_url, s.proof_level, s.is_validated, s.submitted_at,
    p.id, p.username, p.division, p.faction, p.avatar_url,
    c.id, c.title, c.score_type
  FROM public.scores s
  JOIN public.profiles p ON p.id = s.user_id
  JOIN public.challenges c ON c.id = s.challenge_id
  WHERE s.is_hidden = false
    AND s.proof_level <> 'judge_verified'
    AND EXISTS (
      SELECT 1
      FROM public.profiles caller
      WHERE caller.id = auth.uid()
        AND (caller.role IN ('coach', 'gym_admin') OR public.is_platform_admin())
        AND (
          public.is_platform_admin()
          OR (caller.affiliated_gym_id IS NOT NULL AND p.affiliated_gym_id = caller.affiliated_gym_id)
        )
    )
  ORDER BY s.submitted_at DESC
  LIMIT 200;
$$;

-- 3. Verify action — only gym staff, only on a member of their own gym (admins: any).
CREATE OR REPLACE FUNCTION public.verify_score(p_score_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller      uuid := auth.uid();
  v_caller_gym  uuid;
  v_is_staff    boolean;
  v_athlete_gym uuid;
BEGIN
  SELECT affiliated_gym_id, (role IN ('coach', 'gym_admin'))
    INTO v_caller_gym, v_is_staff
  FROM public.profiles WHERE id = v_caller;

  IF NOT (COALESCE(v_is_staff, false) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'not_gym_staff';
  END IF;

  SELECT p.affiliated_gym_id INTO v_athlete_gym
  FROM public.scores s
  JOIN public.profiles p ON p.id = s.user_id
  WHERE s.id = p_score_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'score_not_found';
  END IF;

  IF NOT public.is_platform_admin()
     AND (v_caller_gym IS NULL OR v_athlete_gym IS DISTINCT FROM v_caller_gym) THEN
    RAISE EXCEPTION 'score_not_in_your_gym';
  END IF;

  -- Bypass the proof-immutability guard for the is_validated flip (proof_level set below).
  PERFORM set_config('tg.proof_bypass', '1', true);
  UPDATE public.scores
  SET is_validated = true,
      verified_by_coach_id = v_caller
  WHERE id = p_score_id;

  -- Promote to judge_verified (idempotent: no-op if already there) + write the audit row.
  PERFORM public.upgrade_score_proof_level(
    p_score_id, 'judge_verified'::public.proof_level, 'judge', v_caller
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.pending_verifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_score(uuid) TO authenticated;
