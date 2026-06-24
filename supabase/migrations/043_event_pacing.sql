-- V3-07 (#116): Pacing Assistant. A coach sets a benchmark target time + segment count on an
-- event; each athlete gets a personalized target + even splits, scaled by their Engine rating.
-- Transparent heuristic (a guide, not a prediction): factor = clamp(50 / engine, 0.75, 1.4) so
-- the median athlete (rating 50) gets the benchmark, elites ~25% faster, beginners ~40% slower.
-- Additive & non-breaking.

CREATE TABLE IF NOT EXISTS public.gym_event_pacing (
  event_id          UUID        PRIMARY KEY REFERENCES public.gym_events(id) ON DELETE CASCADE,
  benchmark_seconds INT         NOT NULL CHECK (benchmark_seconds > 0 AND benchmark_seconds <= 36000),
  segments          INT         NOT NULL CHECK (segments BETWEEN 1 AND 20),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gym_event_pacing IS
  'V3-07: per-event pacing plan (benchmark finish + segments). Athlete target derived from Engine rating.';

ALTER TABLE public.gym_event_pacing ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gym_event_pacing'
                 AND policyname = 'Gym people read their event pacing') THEN
    CREATE POLICY "Gym people read their event pacing"
      ON public.gym_event_pacing FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.gym_events e
        WHERE e.id = gym_event_pacing.event_id
          AND (
            public.is_platform_admin()
            OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = e.gym_id)
            OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = e.gym_id AND g.owner_id = auth.uid())
          )
      ));
  END IF;
END $$;

-- Coach sets/updates the pacing plan (staff of the event's gym).
CREATE OR REPLACE FUNCTION public.set_event_pacing(
  p_event_id          uuid,
  p_benchmark_seconds int,
  p_segments          int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_can_manage_gym_event(p_event_id);
  IF p_benchmark_seconds <= 0 OR p_benchmark_seconds > 36000 THEN
    RAISE EXCEPTION 'bad_benchmark';
  END IF;
  IF p_segments < 1 OR p_segments > 20 THEN
    RAISE EXCEPTION 'bad_segments';
  END IF;

  INSERT INTO public.gym_event_pacing (event_id, benchmark_seconds, segments, updated_at)
  VALUES (p_event_id, p_benchmark_seconds, p_segments, NOW())
  ON CONFLICT (event_id) DO UPDATE
    SET benchmark_seconds = EXCLUDED.benchmark_seconds,
        segments = EXCLUDED.segments,
        updated_at = NOW();
END;
$$;

-- The caller's personalized pacing for an event (scaled by their Engine rating).
CREATE OR REPLACE FUNCTION public.my_event_pacing(p_event_id uuid)
RETURNS TABLE (
  benchmark_seconds       int,
  segments                int,
  engine                  numeric,
  factor                  numeric,
  personal_target_seconds int,
  split_seconds           int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH plan AS (
    SELECT pc.benchmark_seconds, pc.segments
    FROM public.gym_event_pacing pc WHERE pc.event_id = p_event_id
  ),
  eng AS (
    SELECT COALESCE((SELECT rating_engine FROM public.profile_ratings WHERE user_id = auth.uid()), 50)::numeric AS engine
  ),
  calc AS (
    SELECT p.benchmark_seconds, p.segments, e.engine,
           greatest(0.75, least(1.4, 50.0 / greatest(e.engine, 1))) AS factor
    FROM plan p CROSS JOIN eng e
  )
  SELECT benchmark_seconds,
         segments,
         round(engine, 1),
         round(factor, 2),
         round(benchmark_seconds * factor)::int AS personal_target_seconds,
         round(benchmark_seconds * factor / segments)::int AS split_seconds
  FROM calc;
$$;

GRANT EXECUTE ON FUNCTION public.set_event_pacing(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_event_pacing(uuid) TO authenticated;
