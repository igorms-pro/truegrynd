-- V4-03 (#169): the booking ⇄ WOD loop. A gym programs ONE WOD per day (classic box
-- programming — SugarWOD DNA); it shows on the booking cards, and scores flow through the
-- core challenge pipeline (proof levels → Judge Console → leaderboard → realtime), exactly
-- like gym events (migration 036). The day's leaderboard IS the class leaderboard.

CREATE TABLE IF NOT EXISTS public.gym_wods (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id       UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  wod_date     DATE        NOT NULL,
  challenge_id UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_by   UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gym_id, wod_date)
);

COMMENT ON TABLE public.gym_wods IS
  'V4-03: daily WOD programming. One WOD per gym per day, backed by a gym-scoped challenge (same pattern as gym_events).';

CREATE INDEX IF NOT EXISTS idx_gym_wods_gym_date ON public.gym_wods (gym_id, wod_date DESC);

ALTER TABLE public.gym_wods ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_wods'
      AND policyname = 'Gym people can read their gym wods'
  ) THEN
    CREATE POLICY "Gym people can read their gym wods"
      ON public.gym_wods FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_wods.gym_id)
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_wods.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
END $$;

-- Writes via RPC only.

-- Program (or reprogram) the WOD of a given day for the caller's gym. Staff-only.
-- First call materializes a gym-scoped challenge (approved, off-arena) + its 'standard'
-- variant; a second call on the same date UPDATES that challenge in place (free edit,
-- already-posted scores stay attached).
CREATE OR REPLACE FUNCTION public.program_gym_wod(
  p_wod_date   date,
  p_title      text,
  p_workout    text,
  p_score_type text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller    uuid := auth.uid();
  v_gym       uuid;
  v_staff     boolean;
  v_owner     boolean;
  v_existing  uuid;
  v_challenge uuid;
BEGIN
  SELECT affiliated_gym_id, (role IN ('coach', 'gym_admin'))
    INTO v_gym, v_staff
  FROM public.profiles WHERE id = v_caller;

  IF v_gym IS NULL THEN
    RAISE EXCEPTION 'no_gym';
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = v_gym AND g.owner_id = v_caller)
    INTO v_owner;
  IF NOT (COALESCE(v_staff, false) OR v_owner OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'not_gym_staff';
  END IF;
  IF p_score_type NOT IN ('time', 'reps') THEN
    RAISE EXCEPTION 'bad_score_type';
  END IF;
  IF length(btrim(p_title)) < 2 THEN
    RAISE EXCEPTION 'bad_title';
  END IF;

  SELECT challenge_id INTO v_existing
  FROM public.gym_wods WHERE gym_id = v_gym AND wod_date = p_wod_date;

  IF v_existing IS NOT NULL THEN
    UPDATE public.challenges
    SET title = btrim(p_title),
        description = coalesce(nullif(btrim(p_workout), ''), btrim(p_title)),
        rules = coalesce(nullif(btrim(p_workout), ''), btrim(p_title)),
        score_type = p_score_type
    WHERE id = v_existing;
    RETURN jsonb_build_object('challenge_id', v_existing, 'updated', true);
  END IF;

  INSERT INTO public.challenges (title, description, rules, score_type, gym_id, creator_id,
                                 is_official, status, ends_at)
  VALUES (btrim(p_title), coalesce(nullif(btrim(p_workout), ''), btrim(p_title)),
          coalesce(nullif(btrim(p_workout), ''), btrim(p_title)), p_score_type, v_gym, v_caller,
          false, 'approved',
          ((p_wod_date + 1)::timestamp AT TIME ZONE 'Europe/Paris'))
  RETURNING id INTO v_challenge;

  INSERT INTO public.challenge_variants (challenge_id, variant)
  VALUES (v_challenge, 'standard')
  ON CONFLICT (challenge_id, variant) DO NOTHING;

  INSERT INTO public.gym_wods (gym_id, wod_date, challenge_id, created_by)
  VALUES (v_gym, p_wod_date, v_challenge, v_caller);

  RETURN jsonb_build_object('challenge_id', v_challenge, 'updated', false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.program_gym_wod(date, text, text, text) TO authenticated;

-- One week of the caller's gym WOD programming (drives the planning strip + booking cards).
CREATE OR REPLACE FUNCTION public.week_wods(p_monday date)
RETURNS TABLE (
  wod_date     date,
  challenge_id uuid,
  title        text,
  workout      text,
  score_type   text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.wod_date, w.challenge_id, c.title, c.rules, c.score_type
  FROM public.gym_wods w
  JOIN public.challenges c ON c.id = w.challenge_id
  JOIN public.profiles caller ON caller.id = auth.uid() AND caller.affiliated_gym_id = w.gym_id
  WHERE w.wod_date BETWEEN p_monday AND p_monday + 6
  ORDER BY w.wod_date;
$$;

GRANT EXECUTE ON FUNCTION public.week_wods(date) TO authenticated;
