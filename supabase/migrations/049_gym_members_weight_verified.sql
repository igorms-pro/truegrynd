-- Medium-term roster filters (age categories, verified athletes, weight classes): gym_members
-- gains weight_kg and the member's count of judge-verified scores. Age categories are derived
-- client-side from `age`. Return type changes → drop + recreate (scoping unchanged from 046).

DROP FUNCTION IF EXISTS public.gym_members();

CREATE FUNCTION public.gym_members()
RETURNS TABLE (
  id uuid,
  username text,
  division text,
  faction text,
  sex text,
  age int,
  weight_kg numeric,
  verified_count int,
  avatar_url text,
  last_activity_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.division, p.faction, p.sex, p.age, p.weight_kg,
         (SELECT count(*)::int
            FROM public.scores s
            WHERE s.user_id = p.id
              AND s.is_hidden = false
              AND s.proof_level = 'judge_verified') AS verified_count,
         p.avatar_url, p.last_activity_at
  FROM public.profiles p
  JOIN public.profiles caller ON caller.id = auth.uid()
  WHERE caller.affiliated_gym_id IS NOT NULL
    AND p.affiliated_gym_id = caller.affiliated_gym_id
  ORDER BY p.last_activity_at DESC NULLS LAST
  LIMIT 500;
$$;

GRANT EXECUTE ON FUNCTION public.gym_members() TO authenticated;
