-- V4-04 (#170): the retention engine — the lead sales argument. Incumbents tell a gym who
-- paid; we tell them WHO THEY ARE ABOUT TO LOSE. v1 keeps the signal simple & explainable:
-- a member who used to train (activity in the 30→60d window) and has gone quiet ≥14 days.
--   'high'  = inactive ≥ 30 days
--   'watch' = inactive 14–29 days
-- Email is exposed to gym staff for the manual re-engagement nudge (normal gym-management
-- data — Peppy/Resawod show it too). Staff/owner/platform-admin only, scoped to their gym.

CREATE OR REPLACE FUNCTION public.gym_at_risk_members()
RETURNS TABLE (
  user_id          uuid,
  username         text,
  division         text,
  faction          text,
  email            text,
  last_activity_at timestamptz,
  days_inactive    int,
  prev_scores      int,
  risk             text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    p.division,
    p.faction,
    u.email,
    p.last_activity_at,
    (CURRENT_DATE - p.last_activity_at::date)::int,
    (SELECT count(*)::int FROM public.scores s
      WHERE s.user_id = p.id AND s.is_hidden = false
        AND s.submitted_at >= NOW() - interval '60 days'
        AND s.submitted_at <  NOW() - interval '30 days') AS prev_scores,
    CASE WHEN p.last_activity_at < NOW() - interval '30 days' THEN 'high' ELSE 'watch' END
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  JOIN public.profiles caller ON caller.id = auth.uid()
  WHERE p.affiliated_gym_id = caller.affiliated_gym_id
    AND caller.affiliated_gym_id IS NOT NULL
    AND (
      caller.role IN ('coach', 'gym_admin')
      OR public.is_platform_admin()
      OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = caller.affiliated_gym_id AND g.owner_id = caller.id)
    )
    AND p.id <> caller.id
    AND p.last_activity_at IS NOT NULL
    AND p.last_activity_at < NOW() - interval '14 days'
  ORDER BY p.last_activity_at ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.gym_at_risk_members() TO authenticated;
