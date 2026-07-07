-- V4-09 (#176): import & migration from incumbents (Peppy, Hustle Up, Resawod, CSV…).
-- Staff imports a member list → rows land here as 'pending' → invites go out (Edge Function
-- invite-members, service role) → when the person signs up (or already has an account),
-- they are AUTO-AFFILIATED to the gym and the row flips to 'joined'. This is the switching
---cost killer: a box moves its whole roster over in one upload.

CREATE TABLE IF NOT EXISTS public.gym_member_imports (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id         UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  email          TEXT        NOT NULL CHECK (position('@' in email) > 1),
  full_name      TEXT        NULL,
  sex            TEXT        NULL CHECK (sex IS NULL OR sex IN ('male', 'female', 'other')),
  age            INT         NULL CHECK (age IS NULL OR age BETWEEN 10 AND 100),
  status         TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'joined')),
  invited_at     TIMESTAMPTZ NULL,
  joined_user_id UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by     UUID        NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gym_id, email)
);

COMMENT ON TABLE public.gym_member_imports IS
  'V4-09: imported roster rows (CSV from Peppy/Hustle Up/…). pending → invited → joined (auto-affiliation trigger).';

CREATE INDEX IF NOT EXISTS idx_gym_member_imports_gym ON public.gym_member_imports (gym_id, status);
CREATE INDEX IF NOT EXISTS idx_gym_member_imports_email ON public.gym_member_imports (lower(email));

ALTER TABLE public.gym_member_imports ENABLE ROW LEVEL SECURITY;

-- Staff/owner/platform-admin of the gym manage their import list (insert normalizes email
-- client-side; unique(gym_id, email) dedupes).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_member_imports' AND policyname='Gym staff manage imports') THEN
    CREATE POLICY "Gym staff manage imports"
      ON public.gym_member_imports FOR ALL TO authenticated
      USING (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_member_imports.gym_id AND p.role IN ('coach', 'gym_admin'))
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_member_imports.gym_id AND g.owner_id = auth.uid())
      )
      WITH CHECK (
        public.is_platform_admin()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.affiliated_gym_id = gym_member_imports.gym_id AND p.role IN ('coach', 'gym_admin'))
        OR EXISTS (SELECT 1 FROM public.gyms g WHERE g.id = gym_member_imports.gym_id AND g.owner_id = auth.uid())
      );
  END IF;
END $$;

-- Auto-affiliation: when a profile appears (signup), match the signup email against the
-- import list → affiliate to the gym, prefill sex/age if absent, flip the row to 'joined'.
CREATE OR REPLACE FUNCTION public.match_gym_import()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  imp     public.gym_member_imports;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = NEW.id;
  IF v_email IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO imp FROM public.gym_member_imports
  WHERE lower(email) = lower(v_email) AND status IN ('pending', 'invited')
  ORDER BY created_at DESC
  LIMIT 1;
  IF imp.id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.profiles
  SET affiliated_gym_id = imp.gym_id,
      sex = COALESCE(sex, imp.sex),
      age = COALESCE(age, imp.age)
  WHERE id = NEW.id;

  UPDATE public.gym_member_imports
  SET status = 'joined', joined_user_id = NEW.id
  WHERE id = imp.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_match_import ON public.profiles;
CREATE TRIGGER on_profile_created_match_import
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.match_gym_import();

-- Service-role helper for the invite-members Edge Function: does this email already have an
-- account? (auth.users is not reachable through PostgREST otherwise.) NOT for clients.
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;
