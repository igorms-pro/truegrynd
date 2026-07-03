-- QA v3 fix: gym_members() and gym_overview() are "my gym" views, but both carried an
-- `is_platform_admin()` bypass that UNSCOPED them entirely — a platform_admin who also runs a
-- gym (e.g. the founder testing their own box) saw EVERY profile/score on the platform as their
-- gym's roster + KPIs, not just their gym's. These functions must always scope to the caller's
-- affiliated_gym_id; platform-wide views live under /admin. (Same family of fix as #152.)

CREATE OR REPLACE FUNCTION public.gym_members()
RETURNS TABLE (
  id uuid,
  username text,
  division text,
  faction text,
  avatar_url text,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.division, p.faction, p.avatar_url, p.last_activity_at
  FROM public.profiles p
  JOIN public.profiles caller ON caller.id = auth.uid()
  WHERE caller.affiliated_gym_id IS NOT NULL
    AND p.affiliated_gym_id = caller.affiliated_gym_id
  ORDER BY p.last_activity_at DESC NULLS LAST
  LIMIT 500;
$$;

GRANT EXECUTE ON FUNCTION public.gym_members() TO authenticated;

CREATE OR REPLACE FUNCTION public.gym_overview()
RETURNS TABLE (member_count integer, pending_count integer, active_7d_count integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym uuid;
BEGIN
  SELECT affiliated_gym_id INTO v_gym
  FROM public.profiles
  WHERE id = auth.uid();

  -- No gym affiliated (incl. a platform_admin not running a box) → zeros.
  IF v_gym IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*)::int
       FROM public.profiles p
       WHERE p.affiliated_gym_id = v_gym),
    (SELECT count(*)::int
       FROM public.scores s
       JOIN public.profiles p ON p.id = s.user_id
       WHERE s.is_hidden = false
         AND s.proof_level <> 'judge_verified'
         AND p.affiliated_gym_id = v_gym),
    (SELECT count(*)::int
       FROM public.profiles p
       WHERE p.affiliated_gym_id = v_gym
         AND p.last_activity_at >= now() - interval '7 days');
END;
$$;

GRANT EXECUTE ON FUNCTION public.gym_overview() TO authenticated;

-- Same bypass in the Judge queue: a platform_admin saw EVERY pending score on the platform,
-- not their gym's. Keep the staff/admin role gate, but always scope to the caller's own gym.
CREATE OR REPLACE FUNCTION public.pending_verifications()
RETURNS TABLE (
  score_id uuid, value numeric, video_url text, proof_level proof_level,
  is_validated boolean, submitted_at timestamptz, athlete_id uuid,
  athlete_username text, athlete_division text, athlete_faction text,
  athlete_avatar_url text, challenge_id uuid, challenge_title text, score_type text
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
        AND caller.affiliated_gym_id IS NOT NULL
        AND p.affiliated_gym_id = caller.affiliated_gym_id
        AND (caller.role IN ('coach', 'gym_admin') OR public.is_platform_admin())
    )
  ORDER BY s.submitted_at DESC
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.pending_verifications() TO authenticated;
