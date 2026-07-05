-- QA design pass: the members roster gains real filters (sex, age, division). gym_members
-- now returns sex + age so the UI can filter without a second query. Return type changes,
-- so drop + recreate (scoping unchanged from 046: always the caller's own gym).

DROP FUNCTION IF EXISTS public.gym_members();

CREATE FUNCTION public.gym_members()
RETURNS TABLE (
  id uuid,
  username text,
  division text,
  faction text,
  sex text,
  age int,
  avatar_url text,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.division, p.faction, p.sex, p.age, p.avatar_url, p.last_activity_at
  FROM public.profiles p
  JOIN public.profiles caller ON caller.id = auth.uid()
  WHERE caller.affiliated_gym_id IS NOT NULL
    AND p.affiliated_gym_id = caller.affiliated_gym_id
  ORDER BY p.last_activity_at DESC NULLS LAST
  LIMIT 500;
$$;

GRANT EXECUTE ON FUNCTION public.gym_members() TO authenticated;
