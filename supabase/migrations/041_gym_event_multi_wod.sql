-- V3-05 follow-up (#136): multi-WOD gym events + cumulative standings. An event can hold
-- 1..N workouts; the existing single workout (gym_events.challenge_id) is backfilled as WOD #1.
-- Standings = CrossFit-Open style: per workout points = (participants - rank + 1), summed across
-- workouts (a missed workout scores 0). Additive & non-breaking.

CREATE TABLE IF NOT EXISTS public.gym_event_workouts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID        NOT NULL REFERENCES public.gym_events(id) ON DELETE CASCADE,
  challenge_id UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  sort_order   INT         NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, sort_order),
  UNIQUE (event_id, challenge_id)
);

COMMENT ON TABLE public.gym_event_workouts IS
  'V3-05 #136: ordered workouts (gym-scoped challenges) of a gym event.';

ALTER TABLE public.gym_event_workouts ENABLE ROW LEVEL SECURITY;

-- READ: same audience as the parent event (gym members / owner / platform admin).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gym_event_workouts'
                 AND policyname = 'Gym people read their event workouts') THEN
    CREATE POLICY "Gym people read their event workouts"
      ON public.gym_event_workouts FOR SELECT TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.gym_events e
        WHERE e.id = gym_event_workouts.event_id
          AND (
            public.is_platform_admin()
            OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = e.gym_id)
            OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = e.gym_id AND g.owner_id = auth.uid())
          )
      ));
  END IF;
END $$;

-- Backfill the existing single workout as WOD #1.
INSERT INTO public.gym_event_workouts (event_id, challenge_id, sort_order)
SELECT id, challenge_id, 1 FROM public.gym_events WHERE challenge_id IS NOT NULL
ON CONFLICT (event_id, challenge_id) DO NOTHING;

-- Append a workout to an event (staff of its gym). Creates the gym-scoped challenge like
-- create_gym_event does, then links it at the next sort_order.
CREATE OR REPLACE FUNCTION public.add_gym_event_workout(
  p_event_id   uuid,
  p_title      text,
  p_workout    text,
  p_score_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller    uuid := auth.uid();
  v_gym       uuid;
  v_ends      timestamptz;
  v_challenge uuid;
  v_next      int;
BEGIN
  PERFORM public.assert_can_manage_gym_event(p_event_id);
  IF p_score_type NOT IN ('time', 'reps') THEN
    RAISE EXCEPTION 'bad_score_type';
  END IF;

  SELECT gym_id, ends_at INTO v_gym, v_ends FROM public.gym_events WHERE id = p_event_id;

  INSERT INTO public.challenges (title, description, rules, score_type, gym_id, creator_id,
                                 is_official, status, ends_at)
  VALUES (btrim(p_title), btrim(p_title),
          coalesce(nullif(btrim(p_workout), ''), btrim(p_title)), p_score_type, v_gym, v_caller,
          false, 'approved', v_ends)
  RETURNING id INTO v_challenge;

  INSERT INTO public.challenge_variants (challenge_id, variant)
  VALUES (v_challenge, 'standard') ON CONFLICT (challenge_id, variant) DO NOTHING;

  SELECT coalesce(max(sort_order), 0) + 1 INTO v_next
  FROM public.gym_event_workouts WHERE event_id = p_event_id;

  INSERT INTO public.gym_event_workouts (event_id, challenge_id, sort_order)
  VALUES (p_event_id, v_challenge, v_next);

  RETURN v_challenge;
END;
$$;

-- Workouts of an event (ordered).
CREATE OR REPLACE FUNCTION public.gym_event_workouts_list(p_event_id uuid)
RETURNS TABLE (challenge_id uuid, title text, score_type text, rules text, sort_order int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT w.challenge_id, c.title, c.score_type, c.rules, w.sort_order
  FROM public.gym_event_workouts w
  JOIN public.challenges c ON c.id = w.challenge_id
  WHERE w.event_id = p_event_id
  ORDER BY w.sort_order;
$$;

-- Cumulative standings across all workouts (Open-style points; missed workout = 0).
CREATE OR REPLACE FUNCTION public.gym_event_standings(p_event_id uuid)
RETURNS TABLE (
  user_id      uuid,
  username     text,
  avatar_url   text,
  faction      text,
  total_points bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH workouts AS (
    SELECT w.challenge_id, c.score_type
    FROM public.gym_event_workouts w
    JOIN public.challenges c ON c.id = w.challenge_id
    WHERE w.event_id = p_event_id
  ),
  best AS (
    SELECT s.challenge_id, s.user_id, wo.score_type,
           CASE WHEN wo.score_type = 'time' THEN min(s.value) ELSE max(s.value) END AS val
    FROM public.scores s
    JOIN workouts wo ON wo.challenge_id = s.challenge_id
    WHERE s.is_validated = true
    GROUP BY s.challenge_id, s.user_id, wo.score_type
  ),
  ranked AS (
    SELECT b.challenge_id, b.user_id,
           rank() OVER (
             PARTITION BY b.challenge_id
             ORDER BY (CASE WHEN b.score_type = 'time' THEN b.val END) ASC NULLS LAST,
                      (CASE WHEN b.score_type = 'reps' THEN b.val END) DESC NULLS LAST
           ) AS rnk,
           count(*) OVER (PARTITION BY b.challenge_id) AS n
    FROM best b
  )
  SELECT r.user_id, p.username, p.avatar_url, p.faction,
         sum(r.n - r.rnk + 1)::bigint AS total_points
  FROM ranked r
  JOIN public.profiles p ON p.id = r.user_id
  GROUP BY r.user_id, p.username, p.avatar_url, p.faction
  ORDER BY total_points DESC
  LIMIT 200;
$$;

-- Redefine create_gym_event so newly created events also register their primary workout as
-- WOD #1 in gym_event_workouts (the migration backfill only covered pre-existing events).
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

  INSERT INTO public.challenges (title, description, rules, score_type, gym_id, creator_id,
                                 is_official, status, ends_at)
  VALUES (btrim(p_title), coalesce(nullif(btrim(p_description), ''), btrim(p_title)),
          coalesce(nullif(btrim(p_workout), ''), btrim(p_title)), p_score_type, v_gym, v_caller,
          false, 'approved', p_ends_at)
  RETURNING id INTO v_challenge;

  INSERT INTO public.challenge_variants (challenge_id, variant)
  VALUES (v_challenge, 'standard')
  ON CONFLICT (challenge_id, variant) DO NOTHING;

  INSERT INTO public.gym_events (gym_id, created_by, title, description, workout, score_type,
                                 starts_at, ends_at, challenge_id)
  VALUES (v_gym, v_caller, btrim(p_title), coalesce(p_description, ''), coalesce(p_workout, ''),
          p_score_type, p_starts_at, p_ends_at, v_challenge)
  RETURNING * INTO v_event;

  INSERT INTO public.gym_event_workouts (event_id, challenge_id, sort_order)
  VALUES (v_event.id, v_challenge, 1)
  ON CONFLICT (event_id, challenge_id) DO NOTHING;

  RETURN v_event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_gym_event_workout(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gym_event_workouts_list(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gym_event_standings(uuid) TO authenticated;
