-- V3-05 slice 2a: route gym-event scoring through the EXISTING scoring core.
-- "Big tech" unification: instead of a parallel score silo, a gym event is backed by a
-- gym-scoped challenge (challenges.gym_id). Member scores flow through the normal `scores`
-- pipeline → proof levels → Judge Console validation → leaderboard, all reused. The only
-- new rule: gym-scoped challenges are hidden from the public B2C arena (one query filter).
-- Additive & non-breaking.

-- 1. Scope dimension on challenges. NULL = public B2C challenge; set = belongs to a gym.
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS gym_id UUID NULL REFERENCES public.gyms(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.challenges.gym_id IS
  'V3-05: when set, this challenge backs a gym event and is hidden from the public arena.';

CREATE INDEX IF NOT EXISTS idx_challenges_gym ON public.challenges (gym_id) WHERE gym_id IS NOT NULL;

-- 2. Link a gym event to its backing workout challenge.
ALTER TABLE public.gym_events
  ADD COLUMN IF NOT EXISTS challenge_id UUID NULL REFERENCES public.challenges(id) ON DELETE SET NULL;

-- 3. create_gym_event now also materialises the gym-scoped challenge and links it, so members
-- can submit scores against it immediately (same path as any other challenge).
CREATE OR REPLACE FUNCTION public.create_gym_event(
  p_title       text,
  p_description text,
  p_workout     text,
  p_score_type  text,
  p_starts_at   timestamptz,
  p_ends_at     timestamptz
)
RETURNS public.gym_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller    uuid := auth.uid();
  v_gym       uuid;
  v_staff     boolean;
  v_challenge uuid;
  v_event     public.gym_events;
BEGIN
  SELECT affiliated_gym_id, (role IN ('coach', 'gym_admin'))
    INTO v_gym, v_staff
  FROM public.profiles WHERE id = v_caller;

  IF NOT (COALESCE(v_staff, false) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'not_gym_staff';
  END IF;
  IF v_gym IS NULL THEN
    RAISE EXCEPTION 'no_gym';
  END IF;
  IF p_score_type NOT IN ('time', 'reps') THEN
    RAISE EXCEPTION 'bad_score_type';
  END IF;
  IF p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'bad_window';
  END IF;

  -- Backing gym-scoped challenge (approved, hidden from arena via gym_id). Closes with the event.
  INSERT INTO public.challenges (title, description, rules, score_type, gym_id, creator_id,
                                 is_official, status, ends_at)
  VALUES (btrim(p_title), coalesce(nullif(btrim(p_description), ''), btrim(p_title)),
          coalesce(nullif(btrim(p_workout), ''), btrim(p_title)), p_score_type, v_gym, v_caller,
          false, 'approved', p_ends_at)
  RETURNING id INTO v_challenge;

  -- The scores pipeline requires a matching challenge_variants row (composite FK
  -- scores.(challenge_id, variant) → challenge_variants). Gym events use the standard lane.
  INSERT INTO public.challenge_variants (challenge_id, variant)
  VALUES (v_challenge, 'standard')
  ON CONFLICT (challenge_id, variant) DO NOTHING;

  INSERT INTO public.gym_events (gym_id, created_by, title, description, workout, score_type,
                                 starts_at, ends_at, challenge_id)
  VALUES (v_gym, v_caller, btrim(p_title), coalesce(p_description, ''), coalesce(p_workout, ''),
          p_score_type, p_starts_at, p_ends_at, v_challenge)
  RETURNING * INTO v_event;

  RETURN v_event;
END;
$$;

-- gym_events_list already returns whole rows via SETOF gym_events, so challenge_id is included.
