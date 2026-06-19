-- V3 tranche 2: roster of athletes affiliated to the caller's gym.
-- SECURITY DEFINER so a coach/gym_admin lists their members without broad profile read access.
-- platform_admin sees all profiles. LANGUAGE sql (no OUT-param shadowing of column names).

CREATE OR REPLACE FUNCTION public.gym_members()
RETURNS TABLE (
  id               uuid,
  username         text,
  division         text,
  faction          text,
  avatar_url       text,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.division, p.faction, p.avatar_url, p.last_activity_at
  FROM public.profiles p
  WHERE EXISTS (
    SELECT 1
    FROM public.profiles caller
    WHERE caller.id = auth.uid()
      AND (
        public.is_platform_admin()
        OR (caller.affiliated_gym_id IS NOT NULL AND p.affiliated_gym_id = caller.affiliated_gym_id)
      )
  )
  ORDER BY p.last_activity_at DESC NULLS LAST
  LIMIT 500;
$$;

GRANT EXECUTE ON FUNCTION public.gym_members() TO authenticated;
