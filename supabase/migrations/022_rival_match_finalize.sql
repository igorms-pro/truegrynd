-- V2-07 PR4: server-side rival match completion/expiry + passport rival wins.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_rival_wins_on_public BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.show_rival_wins_on_public IS
  'When false, rival match wins are hidden on /app/u/[username].';

CREATE OR REPLACE FUNCTION public.resolve_rival_match_winner(p_match_id UUID)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.rival_matches%ROWTYPE;
  v_participants UUID[];
  v_challenge RECORD;
  v_wins JSONB := '{}'::JSONB;
  v_round_winner UUID;
  v_uid UUID;
  v_count INT;
  v_max_wins INT := 0;
  v_leader UUID;
  v_leader_count INT := 0;
BEGIN
  SELECT * INTO v_match FROM public.rival_matches WHERE id = p_match_id;
  IF NOT FOUND OR v_match.starts_at IS NULL OR v_match.ends_at IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(array_agg(p.user_id ORDER BY p.user_id), ARRAY[]::UUID[])
  INTO v_participants
  FROM public.rival_match_participants p
  WHERE p.match_id = p_match_id AND p.status = 'accepted';

  IF array_length(v_participants, 1) IS NULL OR array_length(v_participants, 1) < 2 THEN
    RETURN NULL;
  END IF;

  FOREACH v_uid IN ARRAY v_participants LOOP
    v_wins := v_wins || jsonb_build_object(v_uid::TEXT, 0);
  END LOOP;

  FOR v_challenge IN
    SELECT rmc.challenge_id, c.score_type
    FROM public.rival_match_challenges rmc
    JOIN public.challenges c ON c.id = rmc.challenge_id
    WHERE rmc.match_id = p_match_id
    ORDER BY rmc.sort_order
  LOOP
    IF (
      SELECT COUNT(DISTINCT s.user_id)::INT
      FROM public.scores s
      WHERE s.challenge_id = v_challenge.challenge_id
        AND s.is_validated = TRUE
        AND s.user_id = ANY(v_participants)
        AND s.submitted_at >= v_match.starts_at
        AND s.submitted_at <= v_match.ends_at
    ) < array_length(v_participants, 1) THEN
      RETURN NULL;
    END IF;

    WITH best AS (
      SELECT DISTINCT ON (s.user_id)
        s.user_id,
        s.value::NUMERIC AS value
      FROM public.scores s
      WHERE s.challenge_id = v_challenge.challenge_id
        AND s.is_validated = TRUE
        AND s.user_id = ANY(v_participants)
        AND s.submitted_at >= v_match.starts_at
        AND s.submitted_at <= v_match.ends_at
      ORDER BY
        s.user_id,
        CASE WHEN v_challenge.score_type = 'time' THEN s.value END ASC NULLS LAST,
        CASE WHEN v_challenge.score_type = 'reps' THEN s.value END DESC NULLS LAST
    ),
    best_value AS (
      SELECT
        CASE
          WHEN v_challenge.score_type = 'time' THEN MIN(value)
          ELSE MAX(value)
        END AS best_val
      FROM best
    ),
    winners AS (
      SELECT b.user_id
      FROM best b
      CROSS JOIN best_value bv
      WHERE b.value = bv.best_val
    )
    SELECT
      CASE
        WHEN (SELECT COUNT(*)::INT FROM winners) = 1 THEN (SELECT user_id FROM winners LIMIT 1)
        ELSE NULL
      END
    INTO v_round_winner;

    IF v_round_winner IS NOT NULL THEN
      v_count := COALESCE((v_wins ->> v_round_winner::TEXT)::INT, 0) + 1;
      v_wins := jsonb_set(v_wins, ARRAY[v_round_winner::TEXT], to_jsonb(v_count));
    END IF;
  END LOOP;

  FOREACH v_uid IN ARRAY v_participants LOOP
    v_count := COALESCE((v_wins ->> v_uid::TEXT)::INT, 0);
    IF v_count > v_max_wins THEN
      v_max_wins := v_count;
      v_leader := v_uid;
      v_leader_count := 1;
    ELSIF v_count = v_max_wins AND v_count > 0 THEN
      v_leader_count := v_leader_count + 1;
    END IF;
  END LOOP;

  IF v_max_wins = 0 OR v_leader_count <> 1 THEN
    RETURN NULL;
  END IF;

  RETURN v_leader;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_rival_match(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.rival_matches%ROWTYPE;
  v_winner UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF NOT public.rival_match_is_member(p_match_id, auth.uid()) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;

  SELECT * INTO v_match
  FROM public.rival_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'match_not_found';
  END IF;

  IF v_match.status = 'pending'
    AND v_match.created_at + INTERVAL '7 days' <= NOW() THEN
    UPDATE public.rival_matches
    SET status = 'expired'
    WHERE id = p_match_id;
    RETURN;
  END IF;

  IF v_match.status = 'active'
    AND v_match.ends_at IS NOT NULL
    AND v_match.ends_at <= NOW() THEN
    v_winner := public.resolve_rival_match_winner(p_match_id);
    UPDATE public.rival_matches
    SET status = 'completed',
        winner_id = v_winner
    WHERE id = p_match_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_my_due_rival_matches()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_match_id UUID;
  v_count INT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  FOR v_match_id IN
    SELECT m.id
    FROM public.rival_matches m
    WHERE public.rival_match_is_member(m.id, v_user_id)
      AND (
        (m.status = 'active' AND m.ends_at IS NOT NULL AND m.ends_at <= NOW())
        OR (m.status = 'pending' AND m.created_at + INTERVAL '7 days' <= NOW())
      )
  LOOP
    PERFORM public.finalize_rival_match(v_match_id);
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_rival_wins_for_passport(
  p_user_id UUID,
  p_limit INT DEFAULT 12
)
RETURNS TABLE (
  match_id UUID,
  completed_at TIMESTAMPTZ,
  division TEXT,
  opponent_username TEXT,
  challenge_titles TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id AS match_id,
    m.ends_at AS completed_at,
    m.division,
    (
      SELECT pr.username
      FROM public.rival_match_participants rmp
      JOIN public.profiles pr ON pr.id = rmp.user_id
      WHERE rmp.match_id = m.id
        AND rmp.status = 'accepted'
        AND rmp.user_id <> p_user_id
      ORDER BY rmp.invited_at
      LIMIT 1
    ) AS opponent_username,
    COALESCE(
      (
        SELECT array_agg(c.title ORDER BY rmc.sort_order)
        FROM public.rival_match_challenges rmc
        JOIN public.challenges c ON c.id = rmc.challenge_id
        WHERE rmc.match_id = m.id
      ),
      ARRAY[]::TEXT[]
    ) AS challenge_titles
  FROM public.rival_matches m
  WHERE m.winner_id = p_user_id
    AND m.status = 'completed'
  ORDER BY m.ends_at DESC NULLS LAST, m.created_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

GRANT EXECUTE ON FUNCTION public.finalize_rival_match(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_my_due_rival_matches() TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_rival_wins_for_passport(UUID, INT) TO authenticated;
