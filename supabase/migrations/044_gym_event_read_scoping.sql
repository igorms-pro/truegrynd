-- V3 review fix: two SECURITY DEFINER read RPCs (gym_event_workouts_list, gym_event_standings)
-- returned data for ANY event id to any authenticated caller — a cross-gym read by UUID.
-- Add the same membership guard as gym_events_list (platform_admin OR affiliated to the event's
-- gym OR the gym owner). Unauthorized callers now get an empty result. Low severity, defense-in-depth.

CREATE OR REPLACE FUNCTION public.gym_event_workouts_list(p_event_id uuid)
RETURNS TABLE (challenge_id uuid, title text, score_type text, rules text, sort_order int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.challenge_id, c.title, c.score_type, c.rules, w.sort_order
  FROM public.gym_event_workouts w
  JOIN public.challenges c ON c.id = w.challenge_id
  JOIN public.gym_events e ON e.id = w.event_id
  WHERE w.event_id = p_event_id
    AND (
      public.is_platform_admin()
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = e.gym_id)
      OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = e.gym_id AND g.owner_id = auth.uid())
    )
  ORDER BY w.sort_order;
$$;

CREATE OR REPLACE FUNCTION public.gym_event_standings(p_event_id uuid)
RETURNS TABLE (
  user_id      uuid,
  username     text,
  avatar_url   text,
  faction      text,
  total_points bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH workouts AS (
    SELECT w.challenge_id, c.score_type
    FROM public.gym_event_workouts w
    JOIN public.challenges c ON c.id = w.challenge_id
    JOIN public.gym_events e ON e.id = w.event_id
    WHERE w.event_id = p_event_id
      AND (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = e.gym_id)
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = e.gym_id AND g.owner_id = auth.uid())
      )
  ),
  best AS (
    SELECT s.challenge_id, s.user_id, wo.score_type,
           CASE WHEN wo.score_type = 'time' THEN min(s.value) ELSE max(s.value) END AS val
    FROM public.scores s
    JOIN workouts wo ON wo.challenge_id = s.challenge_id
    WHERE s.is_validated = true
    GROUP BY s.challenge_id, s.user_id, wo.score_type
  ),
  ranked AS (
    SELECT b.challenge_id, b.user_id,
           rank() OVER (
             PARTITION BY b.challenge_id
             ORDER BY (CASE WHEN b.score_type = 'time' THEN b.val END) ASC NULLS LAST,
                      (CASE WHEN b.score_type = 'reps' THEN b.val END) DESC NULLS LAST
           ) AS rnk,
           count(*) OVER (PARTITION BY b.challenge_id) AS n
    FROM best b
  )
  SELECT r.user_id, p.username, p.avatar_url, p.faction,
         sum(r.n - r.rnk + 1)::bigint AS total_points
  FROM ranked r
  JOIN public.profiles p ON p.id = r.user_id
  GROUP BY r.user_id, p.username, p.avatar_url, p.faction
  ORDER BY total_points DESC
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.gym_event_workouts_list(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gym_event_standings(uuid) TO authenticated;
