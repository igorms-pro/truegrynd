-- V3-06 follow-up (#139): box-vs-box league standings. Each member gym's score = the average
-- of its members' global rating (rating_global is already normalized 0-100 across challenges /
-- scaling, so it's a fair cross-box metric — "moyenne des membres par scaling"). Gyms ranked by
-- that average. Shared-WOD league matches are a deeper follow-up. Additive & read-only.

CREATE OR REPLACE FUNCTION public.league_standings(p_league_id uuid)
RETURNS TABLE (
  gym_id       uuid,
  gym_name     text,
  member_count bigint,
  rated_count  bigint,
  avg_rating   numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id,
         g.name,
         count(p.id)                              AS member_count,
         count(pr.user_id)                        AS rated_count,
         COALESCE(round(avg(pr.rating_global), 1), 0) AS avg_rating
  FROM public.league_gyms lg
  JOIN public.gyms g ON g.id = lg.gym_id
  LEFT JOIN public.profiles p ON p.affiliated_gym_id = g.id
  LEFT JOIN public.profile_ratings pr ON pr.user_id = p.id
  WHERE lg.league_id = p_league_id
  GROUP BY g.id, g.name
  ORDER BY COALESCE(avg(pr.rating_global), 0) DESC, count(p.id) DESC;
$$;

COMMENT ON FUNCTION public.league_standings IS
  'V3-06 #139: member gyms of a league ranked by average member global rating.';

GRANT EXECUTE ON FUNCTION public.league_standings(uuid) TO authenticated;
