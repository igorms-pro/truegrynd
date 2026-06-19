-- V3 tranche 2: gym dashboard KPIs, scoped to the caller's gym.
-- SECURITY DEFINER so a coach/gym_admin gets aggregates over their members without
-- broad per-row read access. platform_admin sees platform-wide totals.

CREATE OR REPLACE FUNCTION public.gym_overview()
RETURNS TABLE (
  member_count    int,
  pending_count   int,
  active_7d_count int
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym   uuid;
  v_admin boolean;
BEGIN
  SELECT affiliated_gym_id, public.is_platform_admin()
    INTO v_gym, v_admin
  FROM public.profiles
  WHERE id = auth.uid();

  -- A coach/gym_admin with no gym set sees zeros (nothing scoped to them yet).
  RETURN QUERY
  SELECT
    (SELECT count(*)::int
       FROM public.profiles p
       WHERE v_admin OR (v_gym IS NOT NULL AND p.affiliated_gym_id = v_gym)),
    (SELECT count(*)::int
       FROM public.scores s
       JOIN public.profiles p ON p.id = s.user_id
       WHERE s.is_hidden = false
         AND s.proof_level <> 'judge_verified'
         AND (v_admin OR (v_gym IS NOT NULL AND p.affiliated_gym_id = v_gym))),
    (SELECT count(*)::int
       FROM public.profiles p
       WHERE (v_admin OR (v_gym IS NOT NULL AND p.affiliated_gym_id = v_gym))
         AND p.last_activity_at >= now() - interval '7 days');
END;
$$;

GRANT EXECUTE ON FUNCTION public.gym_overview() TO authenticated;
