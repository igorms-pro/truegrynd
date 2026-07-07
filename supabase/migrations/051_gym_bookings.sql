-- V4-02 (#168): reservations. gym_sessions = dated instances of a gym_class (lazily
-- materialized on first booking); gym_bookings = a member's spot (confirmed / waitlisted /
-- cancelled). Booking is transactional (session row locked) so capacity can never be
-- oversold; cancelling a confirmed spot auto-promotes the oldest waitlisted member.
-- Timezone: v1 assumes Europe/Paris (French boxes); a per-gym setting comes with V4 Settings.

CREATE TABLE IF NOT EXISTS public.gym_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id       UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  class_id     UUID        NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  session_date DATE        NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  capacity     INT         NOT NULL CHECK (capacity BETWEEN 1 AND 500),
  status       TEXT        NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, session_date)
);

COMMENT ON TABLE public.gym_sessions IS
  'V4-02: dated instance of a gym_class, materialized on first booking.';

CREATE INDEX IF NOT EXISTS idx_gym_sessions_gym_date ON public.gym_sessions (gym_id, session_date);

CREATE TABLE IF NOT EXISTS public.gym_bookings (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID        NOT NULL REFERENCES public.gym_sessions(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       TEXT        NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
  late_cancel  BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ NULL,
  UNIQUE (session_id, user_id)
);

COMMENT ON TABLE public.gym_bookings IS
  'V4-02: a member''s spot in a session. late_cancel = cancelled a confirmed spot <2h before start (feeds no-show reputation later).';

CREATE INDEX IF NOT EXISTS idx_gym_bookings_session ON public.gym_bookings (session_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_gym_bookings_user ON public.gym_bookings (user_id, created_at DESC);

ALTER TABLE public.gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_bookings ENABLE ROW LEVEL SECURITY;

-- READ sessions: the gym's people / owner / platform admin (same shape as gym_classes).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_sessions'
      AND policyname = 'Gym people can read their gym sessions'
  ) THEN
    CREATE POLICY "Gym people can read their gym sessions"
      ON public.gym_sessions FOR SELECT TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_sessions.gym_id)
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_sessions.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
END $$;

-- READ bookings: your own, or staff/owner/admin of the session's gym.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'gym_bookings'
      AND policyname = 'Own bookings or gym staff'
  ) THEN
    CREATE POLICY "Own bookings or gym staff"
      ON public.gym_bookings FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR public.is_platform_admin()
        OR EXISTS (
          SELECT 1
          FROM public.gym_sessions s
          JOIN public.profiles p ON p.id = auth.uid()
          WHERE s.id = gym_bookings.session_id
            AND p.affiliated_gym_id = s.gym_id
            AND p.role IN ('coach', 'gym_admin')
        )
        OR EXISTS (
          SELECT 1 FROM public.gym_sessions s JOIN public.gyms g ON g.id = s.gym_id
          WHERE s.id = gym_bookings.session_id AND g.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- All writes go through the RPCs below (no INSERT/UPDATE policies).

-- Book a spot. Locks the session row → capacity can never be oversold. Full → waitlist.
CREATE OR REPLACE FUNCTION public.book_session(p_class_id uuid, p_session_date date)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller    uuid := auth.uid();
  v_gym       uuid;
  c           public.gym_classes;
  v_starts    timestamptz;
  v_session   public.gym_sessions;
  v_existing  public.gym_bookings;
  v_confirmed int;
  v_status    text;
BEGIN
  SELECT affiliated_gym_id INTO v_gym FROM public.profiles WHERE id = v_caller;
  SELECT * INTO c FROM public.gym_classes WHERE id = p_class_id;

  IF c.id IS NULL OR v_gym IS NULL OR c.gym_id <> v_gym THEN
    RAISE EXCEPTION 'not_your_gym';
  END IF;
  IF NOT c.is_active THEN
    RAISE EXCEPTION 'class_inactive';
  END IF;
  -- Our weekday: 0 = Monday … 6 = Sunday; ISODOW: 1 = Monday … 7 = Sunday.
  IF EXTRACT(ISODOW FROM p_session_date)::int - 1 <> c.weekday THEN
    RAISE EXCEPTION 'bad_date';
  END IF;
  IF p_session_date < CURRENT_DATE OR p_session_date > CURRENT_DATE + 14 THEN
    RAISE EXCEPTION 'bad_date';
  END IF;

  v_starts := (p_session_date::timestamp + c.start_time) AT TIME ZONE 'Europe/Paris';
  IF v_starts < NOW() THEN
    RAISE EXCEPTION 'session_past';
  END IF;

  INSERT INTO public.gym_sessions (gym_id, class_id, session_date, starts_at, ends_at, capacity)
  VALUES (c.gym_id, c.id, p_session_date, v_starts,
          v_starts + make_interval(mins => c.duration_min), c.capacity)
  ON CONFLICT (class_id, session_date) DO NOTHING;

  SELECT * INTO v_session FROM public.gym_sessions
  WHERE class_id = c.id AND session_date = p_session_date
  FOR UPDATE;

  IF v_session.status <> 'scheduled' THEN
    RAISE EXCEPTION 'session_cancelled';
  END IF;

  SELECT * INTO v_existing FROM public.gym_bookings
  WHERE session_id = v_session.id AND user_id = v_caller;
  IF v_existing.id IS NOT NULL AND v_existing.status <> 'cancelled' THEN
    RAISE EXCEPTION 'already_booked';
  END IF;

  SELECT count(*) INTO v_confirmed FROM public.gym_bookings
  WHERE session_id = v_session.id AND status = 'confirmed';

  v_status := CASE WHEN v_confirmed < v_session.capacity THEN 'confirmed' ELSE 'waitlisted' END;

  IF v_existing.id IS NOT NULL THEN
    UPDATE public.gym_bookings
    SET status = v_status, created_at = NOW(), cancelled_at = NULL, late_cancel = FALSE
    WHERE id = v_existing.id;
  ELSE
    INSERT INTO public.gym_bookings (session_id, user_id, status)
    VALUES (v_session.id, v_caller, v_status);
  END IF;

  RETURN jsonb_build_object('status', v_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_session(uuid, date) TO authenticated;

-- Cancel a booking (owner of the booking, or gym staff). Cancelling a confirmed spot
-- promotes the oldest waitlisted member; <2h before start flags late_cancel.
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller   uuid := auth.uid();
  b          public.gym_bookings;
  s          public.gym_sessions;
  v_is_staff boolean;
  v_late     boolean := FALSE;
  v_promoted uuid;
BEGIN
  SELECT * INTO b FROM public.gym_bookings WHERE id = p_booking_id;
  IF b.id IS NULL THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  SELECT * INTO s FROM public.gym_sessions WHERE id = b.session_id FOR UPDATE;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = v_caller AND p.affiliated_gym_id = s.gym_id AND p.role IN ('coach', 'gym_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.gyms g WHERE g.id = s.gym_id AND g.owner_id = v_caller
  ) OR public.is_platform_admin()
  INTO v_is_staff;

  IF b.user_id <> v_caller AND NOT v_is_staff THEN
    RAISE EXCEPTION 'not_allowed';
  END IF;
  IF b.status = 'cancelled' THEN
    RETURN jsonb_build_object('status', 'cancelled');
  END IF;

  v_late := b.status = 'confirmed' AND s.starts_at - NOW() < interval '2 hours';

  UPDATE public.gym_bookings
  SET status = 'cancelled', cancelled_at = NOW(), late_cancel = v_late
  WHERE id = b.id;

  IF b.status = 'confirmed' THEN
    SELECT id INTO v_promoted FROM public.gym_bookings
    WHERE session_id = s.id AND status = 'waitlisted'
    ORDER BY created_at
    LIMIT 1;
    IF v_promoted IS NOT NULL THEN
      UPDATE public.gym_bookings SET status = 'confirmed' WHERE id = v_promoted;
    END IF;
  END IF;

  RETURN jsonb_build_object('status', 'cancelled', 'late', v_late, 'promoted', v_promoted IS NOT NULL);
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;

-- One week of the caller's gym schedule with live counts + the caller's own booking state.
-- p_monday = the Monday of the requested week. Drives both "Ma salle" and /pro/planning.
CREATE OR REPLACE FUNCTION public.week_bookings(p_monday date)
RETURNS TABLE (
  class_id       uuid,
  session_date   date,
  booked_count   int,
  waitlist_count int,
  my_status      text,
  my_booking_id  uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    (p_monday + c.weekday)::date,
    COALESCE(cnt.confirmed, 0)::int,
    COALESCE(cnt.waitlisted, 0)::int,
    mine.status,
    mine.id
  FROM public.gym_classes c
  JOIN public.profiles caller ON caller.id = auth.uid() AND caller.affiliated_gym_id = c.gym_id
  LEFT JOIN public.gym_sessions s
    ON s.class_id = c.id AND s.session_date = (p_monday + c.weekday)::date
  LEFT JOIN LATERAL (
    SELECT
      count(*) FILTER (WHERE gb.status = 'confirmed')  AS confirmed,
      count(*) FILTER (WHERE gb.status = 'waitlisted') AS waitlisted
    FROM public.gym_bookings gb WHERE gb.session_id = s.id
  ) cnt ON TRUE
  LEFT JOIN public.gym_bookings mine
    ON mine.session_id = s.id AND mine.user_id = auth.uid() AND mine.status <> 'cancelled'
  WHERE c.is_active;
$$;

GRANT EXECUTE ON FUNCTION public.week_bookings(date) TO authenticated;

-- Roster of one session for the coach: who's in (with athletic context), who waits.
-- Staff / owner / platform admin of the gym only.
CREATE OR REPLACE FUNCTION public.session_roster(p_class_id uuid, p_session_date date)
RETURNS TABLE (
  booking_id uuid,
  user_id    uuid,
  username   text,
  division   text,
  faction    text,
  rating     numeric,
  status     text,
  booked_at  timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gb.id, p.id, p.username, p.division, p.faction,
         pr.rating_global, gb.status, gb.created_at
  FROM public.gym_sessions s
  JOIN public.gym_bookings gb ON gb.session_id = s.id AND gb.status <> 'cancelled'
  JOIN public.profiles p ON p.id = gb.user_id
  LEFT JOIN public.profile_ratings pr ON pr.user_id = p.id
  WHERE s.class_id = p_class_id
    AND s.session_date = p_session_date
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles me
        WHERE me.id = auth.uid() AND me.affiliated_gym_id = s.gym_id
          AND me.role IN ('coach', 'gym_admin')
      )
      OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = s.gym_id AND g.owner_id = auth.uid())
      OR public.is_platform_admin()
    )
  ORDER BY (gb.status = 'confirmed') DESC, gb.created_at;
$$;

GRANT EXECUTE ON FUNCTION public.session_roster(uuid, date) TO authenticated;
