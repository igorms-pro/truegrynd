-- QA v2 #7: public-ish gym profile page at /app/gym/[slug]. Any authenticated user (the whole
-- app is auth-gated, like the athlete profile at /app/u/[username]) can look up ANY gym by slug
-- and see its name / location, member count, and non-cancelled events. Existing gym RPCs are all
-- scoped to the CALLER's own gym, so this needs a dedicated by-slug reader. Additive & read-only.

CREATE OR REPLACE FUNCTION public.gym_public_profile(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', g.id,
    'name', g.name,
    'slug', g.slug,
    'city', g.city,
    'countryCode', g.country_code,
    'memberCount', (
      SELECT count(*) FROM public.profiles p WHERE p.affiliated_gym_id = g.id
    ),
    'events', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'title', e.title,
          'startsAt', e.starts_at,
          'endsAt', e.ends_at,
          'scoreType', e.score_type
        ) ORDER BY e.starts_at DESC
      )
      FROM (
        SELECT id, title, starts_at, ends_at, score_type
        FROM public.gym_events ge
        WHERE ge.gym_id = g.id AND ge.status <> 'cancelled'
        ORDER BY ge.starts_at DESC
        LIMIT 20
      ) e
    ), '[]'::jsonb)
  )
  FROM public.gyms g
  WHERE g.slug = p_slug;
$$;

COMMENT ON FUNCTION public.gym_public_profile IS
  'QA v2 #7: single gym by slug — name/location, member count, non-cancelled events (limit 20). '
  'Auth-gated like the rest of the app; returns NULL when the slug is unknown.';

GRANT EXECUTE ON FUNCTION public.gym_public_profile(text) TO authenticated;

-- Add gym_slug to league standings so each row can link to /app/gym/[slug]. Return type changes,
-- so drop + recreate (CREATE OR REPLACE cannot alter the output columns).
DROP FUNCTION IF EXISTS public.league_standings(uuid);

CREATE FUNCTION public.league_standings(p_league_id uuid)
RETURNS TABLE (
  gym_id       uuid,
  gym_name     text,
  gym_slug     text,
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
         g.slug,
         count(p.id)                              AS member_count,
         count(pr.user_id)                        AS rated_count,
         COALESCE(round(avg(pr.rating_global), 1), 0) AS avg_rating
  FROM public.league_gyms lg
  JOIN public.gyms g ON g.id = lg.gym_id
  LEFT JOIN public.profiles p ON p.affiliated_gym_id = g.id
  LEFT JOIN public.profile_ratings pr ON pr.user_id = p.id
  WHERE lg.league_id = p_league_id
  GROUP BY g.id, g.name, g.slug
  ORDER BY COALESCE(avg(pr.rating_global), 0) DESC, count(p.id) DESC;
$$;

COMMENT ON FUNCTION public.league_standings IS
  'V3-06 #139: member gyms of a league ranked by average member global rating. '
  'QA v2 #7: gym_slug added so standings rows link to the public gym page.';

GRANT EXECUTE ON FUNCTION public.league_standings(uuid) TO authenticated;
