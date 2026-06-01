-- Backfill: prod had partial 024 apply (tables/policies) before CLI repair skipped functions.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'events'
      AND policyname = 'Authenticated users can read events'
  ) THEN
    CREATE POLICY "Authenticated users can read events"
      ON public.events FOR SELECT
      TO authenticated
      USING (status <> 'cancelled');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_challenges'
      AND policyname = 'Authenticated users can read event challenges'
  ) THEN
    CREATE POLICY "Authenticated users can read event challenges"
      ON public.event_challenges FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_scores'
      AND policyname = 'Authenticated users can read event scores'
  ) THEN
    CREATE POLICY "Authenticated users can read event scores"
      ON public.event_scores FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'events'
      AND policyname = 'Admins can insert events'
  ) THEN
    CREATE POLICY "Admins can insert events"
      ON public.events FOR INSERT
      TO authenticated
      WITH CHECK (public.is_app_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'events'
      AND policyname = 'Admins can update events'
  ) THEN
    CREATE POLICY "Admins can update events"
      ON public.events FOR UPDATE
      TO authenticated
      USING (public.is_app_admin())
      WITH CHECK (public.is_app_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_challenges'
      AND policyname = 'Admins can insert event challenges'
  ) THEN
    CREATE POLICY "Admins can insert event challenges"
      ON public.event_challenges FOR INSERT
      TO authenticated
      WITH CHECK (public.is_app_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'event_challenges'
      AND policyname = 'Admins can delete event challenges'
  ) THEN
    CREATE POLICY "Admins can delete event challenges"
      ON public.event_challenges FOR DELETE
      TO authenticated
      USING (public.is_app_admin());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.upsert_event_score_on_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id    UUID;
  v_division    TEXT;
  v_score_type  TEXT;
  v_points      NUMERIC;
BEGIN
  IF NOT NEW.is_validated THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_validated THEN
    RETURN NEW;
  END IF;

  SELECT e.id
  INTO v_event_id
  FROM public.events e
  INNER JOIN public.event_challenges ec ON ec.event_id = e.id
  WHERE ec.challenge_id = NEW.challenge_id
    AND e.status NOT IN ('cancelled', 'completed')
    AND NEW.submitted_at >= e.starts_at
    AND NEW.submitted_at < e.ends_at
  ORDER BY e.starts_at DESC
  LIMIT 1;

  IF v_event_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.division
  INTO v_division
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_division IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.score_type
  INTO v_score_type
  FROM public.challenges c
  WHERE c.id = NEW.challenge_id;

  v_points := public.faction_war_contribution_points(NEW.value, COALESCE(v_score_type, 'reps'));

  INSERT INTO public.event_scores (
    event_id, user_id, challenge_id, division, score_id, points
  )
  VALUES (
    v_event_id, NEW.user_id, NEW.challenge_id, v_division, NEW.id, v_points
  )
  ON CONFLICT (event_id, user_id, challenge_id) DO UPDATE
  SET
    points = GREATEST(public.event_scores.points, EXCLUDED.points),
    score_id = CASE
      WHEN EXCLUDED.points > public.event_scores.points THEN EXCLUDED.score_id
      ELSE public.event_scores.score_id
    END,
    division = EXCLUDED.division,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_score_event_score ON public.scores;
CREATE TRIGGER on_score_event_score
  AFTER INSERT OR UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_event_score_on_score();

CREATE OR REPLACE FUNCTION public.admin_upsert_event(
  p_id uuid,
  p_slug text,
  p_title text,
  p_description text,
  p_event_type text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_status text,
  p_challenge_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_slug text;
  v_idx int;
  v_cid uuid;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'invalid_window';
  END IF;

  IF p_status NOT IN ('scheduled', 'active', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  IF p_event_type NOT IN (
    'rookie_week', 'no_equipment_cup', 'faction_war_weekend',
    'city_clash', 'grit_open', 'comeback_week', 'custom'
  ) THEN
    RAISE EXCEPTION 'invalid_event_type';
  END IF;

  v_slug := lower(trim(regexp_replace(p_slug, '[^a-zA-Z0-9-]+', '-', 'g'), '-'));
  IF length(v_slug) < 2 THEN
    RAISE EXCEPTION 'invalid_slug';
  END IF;

  IF p_challenge_ids IS NULL OR array_length(p_challenge_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'no_challenges';
  END IF;

  IF array_length(p_challenge_ids, 1) > 5 THEN
    RAISE EXCEPTION 'too_many_challenges';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_challenge_ids) AS cid
    LEFT JOIN public.challenges c ON c.id = cid AND c.status = 'approved'
    WHERE c.id IS NULL
  ) THEN
    RAISE EXCEPTION 'challenge_not_approved';
  END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.events (
      slug, title, description, event_type, starts_at, ends_at, status
    )
    VALUES (
      v_slug,
      trim(p_title),
      COALESCE(trim(p_description), ''),
      p_event_type,
      p_starts_at,
      p_ends_at,
      p_status
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.events
    SET
      slug = v_slug,
      title = trim(p_title),
      description = COALESCE(trim(p_description), ''),
      event_type = p_event_type,
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      status = p_status,
      updated_at = NOW()
    WHERE id = p_id
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RAISE EXCEPTION 'event_not_found';
    END IF;

    DELETE FROM public.event_challenges WHERE event_id = v_id;
  END IF;

  v_idx := 0;
  FOREACH v_cid IN ARRAY p_challenge_ids LOOP
    v_idx := v_idx + 1;
    INSERT INTO public.event_challenges (event_id, challenge_id, sort_order)
    VALUES (v_id, v_cid, v_idx);
  END LOOP;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_event_standings(
  p_event_id UUID,
  p_division TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  total_points NUMERIC,
  challenges_scored INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    es.user_id,
    p.username,
    SUM(es.points)::NUMERIC AS total_points,
    COUNT(DISTINCT es.challenge_id)::INT AS challenges_scored
  FROM public.event_scores es
  JOIN public.profiles p ON p.id = es.user_id
  WHERE es.event_id = p_event_id
    AND es.division = p_division
  GROUP BY es.user_id, p.username
  ORDER BY total_points DESC, challenges_scored DESC, p.username ASC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION public.get_event_challenge_standings(
  p_event_id UUID,
  p_challenge_id UUID,
  p_division TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  points NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    es.user_id,
    p.username,
    es.points
  FROM public.event_scores es
  JOIN public.profiles p ON p.id = es.user_id
  WHERE es.event_id = p_event_id
    AND es.challenge_id = p_challenge_id
    AND es.division = p_division
  ORDER BY es.points DESC, es.updated_at ASC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION public.get_event_recap(
  p_event_id UUID,
  p_top_n INT DEFAULT 3
)
RETURNS TABLE (
  division TEXT,
  user_id UUID,
  username TEXT,
  total_points NUMERIC,
  rank INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH totals AS (
    SELECT
      es.division,
      es.user_id,
      p.username,
      SUM(es.points)::NUMERIC AS total_points
    FROM public.event_scores es
    JOIN public.profiles p ON p.id = es.user_id
    WHERE es.event_id = p_event_id
    GROUP BY es.division, es.user_id, p.username
  ),
  ranked AS (
    SELECT
      division,
      user_id,
      username,
      total_points,
      ROW_NUMBER() OVER (
        PARTITION BY division
        ORDER BY total_points DESC, username ASC
      )::INT AS rank
    FROM totals
  )
  SELECT division, user_id, username, total_points, rank
  FROM ranked
  WHERE rank <= GREATEST(p_top_n, 1)
  ORDER BY division ASC, rank ASC;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_event(
  uuid, text, text, text, text, timestamptz, timestamptz, text, uuid[]
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_event(
  uuid, text, text, text, text, timestamptz, timestamptz, text, uuid[]
) TO authenticated;

REVOKE ALL ON FUNCTION public.get_event_standings(UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_standings(UUID, TEXT, INT) TO authenticated;

REVOKE ALL ON FUNCTION public.get_event_challenge_standings(UUID, UUID, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_challenge_standings(UUID, UUID, TEXT, INT) TO authenticated;

REVOKE ALL ON FUNCTION public.get_event_recap(UUID, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_event_recap(UUID, INT) TO authenticated;
