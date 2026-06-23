-- V3-05: gym-owned competitions ("Events"). A coach/gym_admin creates an event scoped to
-- THEIR gym: title + description + window + a workout spec built with the B2C circuit/scoring
-- builder. Kept fully separate from the B2C `events` table (different tenant) so gym workouts
-- never leak into the public arena or the B2C events listing. Score submission + standings
-- are a follow-up slice. Additive & non-breaking.

CREATE TABLE IF NOT EXISTS public.gym_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  created_by  UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title       TEXT        NOT NULL CHECK (length(btrim(title)) > 0),
  description TEXT        NOT NULL DEFAULT '',
  workout     TEXT        NOT NULL DEFAULT '',
  score_type  TEXT        NOT NULL CHECK (score_type IN ('time', 'reps')),
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT gym_events_window_check CHECK (ends_at > starts_at)
);

COMMENT ON TABLE public.gym_events IS
  'V3-05: gym-owned competitions. workout = built circuit/scoring spec. The live phase '
  '(upcoming/live/ended) is derived from the window client-side; status only flags cancellation.';

CREATE INDEX IF NOT EXISTS idx_gym_events_gym ON public.gym_events (gym_id, starts_at DESC);

ALTER TABLE public.gym_events ENABLE ROW LEVEL SECURITY;

-- READ: anyone affiliated to the gym (members + staff), the gym owner, or a platform admin.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gym_events'
      AND policyname = 'Gym people can read their gym events'
  ) THEN
    CREATE POLICY "Gym people can read their gym events"
      ON public.gym_events FOR SELECT
      TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_events.gym_id
        )
        OR EXISTS (
          SELECT 1 FROM public.gyms g
          WHERE g.id = gym_events.gym_id AND g.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Writes go exclusively through create_gym_event (SECURITY DEFINER) — no INSERT/UPDATE policy.

-- Create an event for the caller's own gym. Staff-only; the gym is the caller's affiliation.
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
  v_caller uuid := auth.uid();
  v_gym    uuid;
  v_staff  boolean;
  v_event  public.gym_events;
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

  INSERT INTO public.gym_events (gym_id, created_by, title, description, workout, score_type, starts_at, ends_at)
  VALUES (v_gym, v_caller, btrim(p_title), coalesce(p_description, ''), coalesce(p_workout, ''),
          p_score_type, p_starts_at, p_ends_at)
  RETURNING * INTO v_event;

  RETURN v_event;
END;
$$;

COMMENT ON FUNCTION public.create_gym_event IS
  'V3-05: create a competition for the caller''s gym (coach/gym_admin/platform_admin).';

-- List the caller's gym events (most recent window first).
CREATE OR REPLACE FUNCTION public.gym_events_list()
RETURNS SETOF public.gym_events
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.*
  FROM public.gym_events e
  WHERE e.status <> 'cancelled'
    AND (
      public.is_platform_admin()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.affiliated_gym_id = e.gym_id
      )
    )
  ORDER BY e.starts_at DESC
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.create_gym_event(text, text, text, text, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gym_events_list() TO authenticated;
