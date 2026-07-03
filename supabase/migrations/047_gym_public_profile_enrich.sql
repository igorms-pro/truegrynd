-- QA: the public gym page felt too bare. Enrich gym_public_profile with the gym's KYB-verified
-- flag and the leagues it competes in, so the page shows real competitive context, not just a name.
-- Return shape is additive (new keys); existing callers keep working.

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
    'verified', (g.verified_at IS NOT NULL),
    'memberCount', (
      SELECT count(*) FROM public.profiles p WHERE p.affiliated_gym_id = g.id
    ),
    'leagues', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('id', l.id, 'name', l.name, 'scope', l.scope)
        ORDER BY l.name
      )
      FROM public.league_gyms lg
      JOIN public.leagues l ON l.id = lg.league_id
      WHERE lg.gym_id = g.id
    ), '[]'::jsonb),
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

GRANT EXECUTE ON FUNCTION public.gym_public_profile(text) TO authenticated;
