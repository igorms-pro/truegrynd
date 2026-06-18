-- V3-01: gyms (multi-tenant facilities) + athlete affiliation + RLS.
-- Additive & non-breaking. Depends on V3-00 (user_role / has_role).
-- A gym is owned by a gym_admin (owner_id); athletes/coaches affiliate via profiles.affiliated_gym_id.

CREATE TABLE IF NOT EXISTS public.gyms (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT         NOT NULL CHECK (length(btrim(name)) > 0),
  slug         TEXT         NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  owner_id     UUID         NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  city         TEXT         NULL,
  country_code TEXT         NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gyms IS
  'V3-01: B2B2C facilities. owner_id = the gym_admin who manages it; members affiliate via profiles.affiliated_gym_id.';

CREATE INDEX IF NOT EXISTS idx_gyms_owner ON public.gyms (owner_id);

-- Athlete/coach affiliation to a gym. NULL = unaffiliated (the B2C default).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS affiliated_gym_id UUID NULL REFERENCES public.gyms(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.affiliated_gym_id IS
  'V3-01: gym this profile trains at (NULL = unaffiliated). Coaches/gym_admins of that gym can see the member.';

CREATE INDEX IF NOT EXISTS idx_profiles_affiliated_gym ON public.profiles (affiliated_gym_id);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Reusable platform-admin check that honours BOTH the V3 role and the legacy is_admin flag.
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'platform_admin' OR is_admin = true)
  );
$$;

COMMENT ON FUNCTION public.is_platform_admin IS
  'V3-01: true if caller is a platform admin (role platform_admin OR legacy is_admin).';

-- READ: gyms are a public directory for any authenticated user.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gyms'
      AND policyname = 'Authenticated users can read gyms'
  ) THEN
    CREATE POLICY "Authenticated users can read gyms"
      ON public.gyms FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- INSERT: a gym_admin can create a gym they own; platform admins unrestricted.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gyms'
      AND policyname = 'Gym admins can create own gym'
  ) THEN
    CREATE POLICY "Gym admins can create own gym"
      ON public.gyms FOR INSERT
      TO authenticated
      WITH CHECK (
        public.is_platform_admin()
        OR (owner_id = auth.uid() AND public.has_role(ARRAY['gym_admin']::public.user_role[]))
      );
  END IF;
END $$;

-- UPDATE: only the owner (or a platform admin) can edit a gym.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gyms'
      AND policyname = 'Gym owners can update own gym'
  ) THEN
    CREATE POLICY "Gym owners can update own gym"
      ON public.gyms FOR UPDATE
      TO authenticated
      USING (public.is_platform_admin() OR owner_id = auth.uid())
      WITH CHECK (public.is_platform_admin() OR owner_id = auth.uid());
  END IF;
END $$;

-- DELETE: only the owner (or a platform admin) can delete a gym.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'gyms'
      AND policyname = 'Gym owners can delete own gym'
  ) THEN
    CREATE POLICY "Gym owners can delete own gym"
      ON public.gyms FOR DELETE
      TO authenticated
      USING (public.is_platform_admin() OR owner_id = auth.uid());
  END IF;
END $$;
