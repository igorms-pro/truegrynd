-- V4-07 (#173): attendance. The coach ticks who's actually on the floor from the session
-- roster. A check-in feeds the member's activity graph (last_activity_at — so the retention
-- engine V4-04 sees "trained" even without a posted score), and a confirmed booking with no
-- check-in after the session = the no-show signal (V4-02 late_cancel's sibling, consumed by
-- the reputation waitlist in V4-08).

CREATE TABLE IF NOT EXISTS public.gym_checkins (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID        NOT NULL REFERENCES public.gym_sessions(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checked_by    UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, user_id)
);

COMMENT ON TABLE public.gym_checkins IS
  'V4-07: who was actually there. Feeds last_activity_at + the no-show derivation.';

CREATE INDEX IF NOT EXISTS idx_gym_checkins_user ON public.gym_checkins (user_id, checked_in_at DESC);

ALTER TABLE public.gym_checkins ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_checkins' AND policyname='Own checkins or gym staff') THEN
    CREATE POLICY "Own checkins or gym staff"
      ON public.gym_checkins FOR SELECT TO authenticated
      USING (
        user_id = auth.uid()
        OR public.is_platform_admin()
        OR EXISTS (
          SELECT 1 FROM public.gym_sessions s
          JOIN public.profiles p ON p.id = auth.uid()
          WHERE s.id = gym_checkins.session_id
            AND p.affiliated_gym_id = s.gym_id AND p.role IN ('coach', 'gym_admin')
        )
        OR EXISTS (
          SELECT 1 FROM public.gym_sessions s JOIN public.gyms g ON g.id = s.gym_id
          WHERE s.id = gym_checkins.session_id AND g.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Writes via RPC only.

-- Coach floor action: tick / untick a member as present. Staff of the session's gym only.
-- A check-in bumps the member's last_activity_at (server-managed field → local guard bypass),
-- so attending class counts as activity even without a posted score.
CREATE OR REPLACE FUNCTION public.toggle_checkin(p_session_id uuid, p_user_id uuid, p_present boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  s        public.gym_sessions;
  v_staff  boolean;
BEGIN
  SELECT * INTO s FROM public.gym_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN
    RAISE EXCEPTION 'not_found';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = v_caller AND p.affiliated_gym_id = s.gym_id AND p.role IN ('coach', 'gym_admin')
  ) OR EXISTS (
    SELECT 1 FROM public.gyms g WHERE g.id = s.gym_id AND g.owner_id = v_caller
  ) OR public.is_platform_admin()
  INTO v_staff;
  IF NOT v_staff THEN
    RAISE EXCEPTION 'not_gym_staff';
  END IF;

  IF p_present THEN
    INSERT INTO public.gym_checkins (session_id, user_id, checked_by)
    VALUES (p_session_id, p_user_id, v_caller)
    ON CONFLICT (session_id, user_id) DO NOTHING;

    -- Attendance = activity: bump the server-managed field within this transaction only.
    PERFORM set_config('app.server_managed_update', 'true', true);
    UPDATE public.profiles
    SET last_activity_at = GREATEST(COALESCE(last_activity_at, NOW()), NOW())
    WHERE id = p_user_id;
  ELSE
    DELETE FROM public.gym_checkins WHERE session_id = p_session_id AND user_id = p_user_id;
  END IF;

  RETURN jsonb_build_object('present', p_present);
END;
$$;

GRANT EXECUTE ON FUNCTION public.toggle_checkin(uuid, uuid, boolean) TO authenticated;

-- session_roster gains the check-in state (return type changes → drop + recreate).
DROP FUNCTION IF EXISTS public.session_roster(uuid, date);

CREATE FUNCTION public.session_roster(p_class_id uuid, p_session_date date)
RETURNS TABLE (
  booking_id uuid,
  user_id    uuid,
  username   text,
  division   text,
  faction    text,
  rating     numeric,
  status     text,
  booked_at  timestamptz,
  checked_in boolean,
  session_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gb.id, p.id, p.username, p.division, p.faction,
         pr.rating_global, gb.status, gb.created_at,
         (ci.id IS NOT NULL), s.id
  FROM public.gym_sessions s
  JOIN public.gym_bookings gb ON gb.session_id = s.id AND gb.status <> 'cancelled'
  JOIN public.profiles p ON p.id = gb.user_id
  LEFT JOIN public.profile_ratings pr ON pr.user_id = p.id
  LEFT JOIN public.gym_checkins ci ON ci.session_id = s.id AND ci.user_id = p.id
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
