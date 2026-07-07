-- V4-01 (#167): gym class schedule — recurring weekly slots ("Planning", Peppy DNA).
-- A gym_class is a TEMPLATE (weekday + time + capacity + coach), not a dated instance;
-- dated gym_sessions + bookings arrive with V4-02. Multi-tenant like every V3 table:
-- keyed on gym_id, RLS-scoped to the gym's people.

CREATE TABLE IF NOT EXISTS public.gym_classes (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id       UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL CHECK (length(btrim(title)) > 0),
  class_type   TEXT        NOT NULL DEFAULT 'wod'
    CHECK (class_type IN ('wod', 'open_gym', 'hyrox', 'weightlifting', 'gymnastics', 'endurance', 'other')),
  -- 0 = Monday … 6 = Sunday (grid renders Monday-first, French convention).
  weekday      INT         NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time   TIME        NOT NULL,
  duration_min INT         NOT NULL DEFAULT 60 CHECK (duration_min BETWEEN 15 AND 480),
  capacity     INT         NOT NULL DEFAULT 16 CHECK (capacity BETWEEN 1 AND 500),
  coach_id     UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gym_classes IS
  'V4-01: recurring weekly class slots (template). Dated instances (gym_sessions) + bookings come with V4-02.';

CREATE INDEX IF NOT EXISTS idx_gym_classes_gym ON public.gym_classes (gym_id, weekday, start_time);

ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;

-- READ: the gym's people (affiliated members), the gym owner, or a platform admin.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gym_classes'
      AND policyname = 'Gym people can read their gym classes'
  ) THEN
    CREATE POLICY "Gym people can read their gym classes"
      ON public.gym_classes FOR SELECT
      TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_classes.gym_id
        )
        OR EXISTS (
          SELECT 1 FROM public.gyms g
          WHERE g.id = gym_classes.gym_id AND g.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- WRITE: staff of THAT gym (coach/gym_admin affiliated to it), the gym owner, or a platform admin.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gym_classes'
      AND policyname = 'Gym staff can manage their gym classes'
  ) THEN
    CREATE POLICY "Gym staff can manage their gym classes"
      ON public.gym_classes FOR ALL
      TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.affiliated_gym_id = gym_classes.gym_id
            AND p.role IN ('coach', 'gym_admin')
        )
        OR EXISTS (
          SELECT 1 FROM public.gyms g
          WHERE g.id = gym_classes.gym_id AND g.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        public.is_platform_admin()
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
            AND p.affiliated_gym_id = gym_classes.gym_id
            AND p.role IN ('coach', 'gym_admin')
        )
        OR EXISTS (
          SELECT 1 FROM public.gyms g
          WHERE g.id = gym_classes.gym_id AND g.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
