-- V3-00: RBAC — user_role on profiles.
-- Additive & non-breaking: legacy `is_admin` is KEPT (existing guards/RLS still work);
-- `role` is the forward model. athlete (default) · coach / gym_admin (/pro) · platform_admin (/admin).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'athlete',
      'coach',
      'gym_admin',
      'platform_admin'
    );
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'athlete';

COMMENT ON COLUMN public.profiles.role IS
  'V3-00: RBAC role. athlete (default) · coach / gym_admin (PRO /pro) · platform_admin (/admin). is_admin kept for back-compat.';

-- Backfill existing platform admins from the legacy is_admin flag.
UPDATE public.profiles
SET role = 'platform_admin'
WHERE is_admin = true
  AND role <> 'platform_admin';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Reusable role check for RLS policies / RPCs (reads the caller's own role).
CREATE OR REPLACE FUNCTION public.has_role(target_roles public.user_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = ANY (target_roles)
  );
$$;
