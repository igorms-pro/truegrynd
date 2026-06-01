-- V2-07 PR1: async rival matches (1v1 / small group, 1–3 challenges, 24h or 7d).

CREATE TABLE IF NOT EXISTS public.rival_matches (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status           TEXT        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'expired')),
  duration_hours   INT         NOT NULL CHECK (duration_hours IN (24, 168)),
  division         TEXT        NOT NULL CHECK (division IN ('rookie', 'regular', 'savage', 'elite')),
  max_participants INT         NOT NULL DEFAULT 2 CHECK (max_participants BETWEEN 2 AND 4),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  starts_at        TIMESTAMPTZ NULL,
  ends_at          TIMESTAMPTZ NULL,
  winner_id        UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  cancelled_at     TIMESTAMPTZ NULL,
  CONSTRAINT rival_matches_window_check CHECK (
    starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at
  )
);

COMMENT ON TABLE public.rival_matches IS
  'V2-07: async rival duel window. Division snapshot at create; scores reuse public.scores in match window.';

CREATE INDEX IF NOT EXISTS idx_rival_matches_creator
  ON public.rival_matches (creator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rival_matches_status
  ON public.rival_matches (status, ends_at)
  WHERE status IN ('pending', 'active');

CREATE TABLE IF NOT EXISTS public.rival_match_challenges (
  match_id     UUID NOT NULL REFERENCES public.rival_matches(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE RESTRICT,
  sort_order   INT  NOT NULL CHECK (sort_order BETWEEN 1 AND 3),
  PRIMARY KEY (match_id, challenge_id),
  UNIQUE (match_id, sort_order)
);

CREATE TABLE IF NOT EXISTS public.rival_match_participants (
  match_id     UUID NOT NULL REFERENCES public.rival_matches(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'accepted', 'declined', 'left')),
  invited_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ NULL,
  PRIMARY KEY (match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rival_match_participants_user
  ON public.rival_match_participants (user_id, status);

ALTER TABLE public.rival_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rival_match_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rival_match_participants ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.rival_match_is_member(
  p_match_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rival_match_participants p
    WHERE p.match_id = p_match_id AND p.user_id = p_user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.rival_matches m
    WHERE m.id = p_match_id AND m.creator_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.count_pending_rival_invites_sent(p_user_id UUID DEFAULT auth.uid())
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INT
  FROM public.rival_matches m
  JOIN public.rival_match_participants p ON p.match_id = m.id
  WHERE m.creator_id = p_user_id
    AND m.status = 'pending'
    AND p.status = 'invited'
    AND p.user_id <> p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.count_pending_rival_invites_received(p_user_id UUID DEFAULT auth.uid())
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INT
  FROM public.rival_match_participants p
  JOIN public.rival_matches m ON m.id = p.match_id
  WHERE p.user_id = p_user_id
    AND p.status = 'invited'
    AND m.status = 'pending';
$$;

CREATE OR REPLACE FUNCTION public.try_activate_rival_match(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match public.rival_matches%ROWTYPE;
  v_accepted INT;
BEGIN
  SELECT * INTO v_match FROM public.rival_matches WHERE id = p_match_id FOR UPDATE;
  IF NOT FOUND OR v_match.status <> 'pending' THEN
    RETURN;
  END IF;

  SELECT COUNT(*)::INT INTO v_accepted
  FROM public.rival_match_participants
  WHERE match_id = p_match_id AND status = 'accepted';

  IF v_accepted < v_match.max_participants THEN
    RETURN;
  END IF;

  UPDATE public.rival_matches
  SET status = 'active',
      starts_at = NOW(),
      ends_at = NOW() + (v_match.duration_hours || ' hours')::INTERVAL
  WHERE id = p_match_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_rival_match(
  p_challenge_ids UUID[],
  p_duration_hours INT,
  p_invitee_username TEXT,
  p_max_participants INT DEFAULT 2
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id UUID := auth.uid();
  v_creator_division TEXT;
  v_invitee_id UUID;
  v_invitee_division TEXT;
  v_match_id UUID;
  v_challenge_id UUID;
  v_sort INT := 0;
  v_len INT;
BEGIN
  IF v_creator_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF public.count_pending_rival_invites_sent(v_creator_id) >= 5 THEN
    RAISE EXCEPTION 'too_many_pending_invites_sent';
  END IF;

  v_len := COALESCE(array_length(p_challenge_ids, 1), 0);
  IF v_len < 1 OR v_len > 3 THEN
    RAISE EXCEPTION 'invalid_challenge_count';
  END IF;

  IF p_duration_hours NOT IN (24, 168) THEN
    RAISE EXCEPTION 'invalid_duration';
  END IF;

  IF p_max_participants NOT BETWEEN 2 AND 4 THEN
    RAISE EXCEPTION 'invalid_max_participants';
  END IF;

  SELECT division INTO v_creator_division
  FROM public.profiles WHERE id = v_creator_id;

  SELECT id, division INTO v_invitee_id, v_invitee_division
  FROM public.profiles
  WHERE lower(username) = lower(trim(p_invitee_username));

  IF v_invitee_id IS NULL THEN
    RAISE EXCEPTION 'invitee_not_found';
  END IF;

  IF v_invitee_id = v_creator_id THEN
    RAISE EXCEPTION 'cannot_invite_self';
  END IF;

  IF v_invitee_division IS DISTINCT FROM v_creator_division THEN
    RAISE EXCEPTION 'division_mismatch';
  END IF;

  IF public.count_pending_rival_invites_received(v_invitee_id) >= 5 THEN
    RAISE EXCEPTION 'invitee_too_many_pending';
  END IF;

  FOREACH v_challenge_id IN ARRAY p_challenge_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = v_challenge_id AND c.status = 'approved'
    ) THEN
      RAISE EXCEPTION 'challenge_not_approved';
    END IF;
  END LOOP;

  INSERT INTO public.rival_matches (
    creator_id, duration_hours, division, max_participants
  )
  VALUES (
    v_creator_id, p_duration_hours, v_creator_division, p_max_participants
  )
  RETURNING id INTO v_match_id;

  FOREACH v_challenge_id IN ARRAY p_challenge_ids LOOP
    v_sort := v_sort + 1;
    INSERT INTO public.rival_match_challenges (match_id, challenge_id, sort_order)
    VALUES (v_match_id, v_challenge_id, v_sort);
  END LOOP;

  INSERT INTO public.rival_match_participants (match_id, user_id, status, responded_at)
  VALUES (v_match_id, v_creator_id, 'accepted', NOW());

  INSERT INTO public.rival_match_participants (match_id, user_id, status)
  VALUES (v_match_id, v_invitee_id, 'invited');

  RETURN v_match_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_rival_match_invite(
  p_match_id UUID,
  p_accept BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_status TEXT;
  v_match_status TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT m.status INTO v_match_status
  FROM public.rival_matches m WHERE m.id = p_match_id FOR UPDATE;

  IF v_match_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'match_not_pending';
  END IF;

  SELECT p.status INTO v_status
  FROM public.rival_match_participants p
  WHERE p.match_id = p_match_id AND p.user_id = v_user_id
  FOR UPDATE;

  IF v_status IS DISTINCT FROM 'invited' THEN
    RAISE EXCEPTION 'not_invited';
  END IF;

  IF p_accept THEN
    UPDATE public.rival_match_participants
    SET status = 'accepted', responded_at = NOW()
    WHERE match_id = p_match_id AND user_id = v_user_id;

    PERFORM public.try_activate_rival_match(p_match_id);
  ELSE
    UPDATE public.rival_match_participants
    SET status = 'declined', responded_at = NOW()
    WHERE match_id = p_match_id AND user_id = v_user_id;

    UPDATE public.rival_matches
    SET status = 'cancelled', cancelled_at = NOW()
    WHERE id = p_match_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_rival_match(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id UUID := auth.uid();
BEGIN
  IF v_creator_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  UPDATE public.rival_matches
  SET status = 'cancelled', cancelled_at = NOW()
  WHERE id = p_match_id
    AND creator_id = v_creator_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'cannot_cancel';
  END IF;
END;
$$;

CREATE POLICY "Rival match members can read matches"
  ON public.rival_matches FOR SELECT
  TO authenticated
  USING (public.rival_match_is_member(id));

CREATE POLICY "Rival match members can read challenges"
  ON public.rival_match_challenges FOR SELECT
  TO authenticated
  USING (public.rival_match_is_member(match_id));

CREATE POLICY "Rival match members can read participants"
  ON public.rival_match_participants FOR SELECT
  TO authenticated
  USING (public.rival_match_is_member(match_id));
