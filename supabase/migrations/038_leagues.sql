-- V3-06 slice 1: inter-box leagues — foundation + gym opt-in. A league groups gyms by scope
-- (local / regional / national). A gym_admin opts their gym in/out. Box-vs-box matches and
-- standings are a follow-up slice. Additive & non-breaking.

CREATE TABLE IF NOT EXISTS public.leagues (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (length(btrim(name)) > 0),
  slug        TEXT        NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  scope       TEXT        NOT NULL CHECK (scope IN ('local', 'regional', 'national')),
  region_code TEXT        NULL,
  status      TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.leagues IS
  'V3-06: inter-box leagues. Platform-managed; gyms opt in via league_gyms.';

CREATE TABLE IF NOT EXISTS public.league_gyms (
  league_id UUID        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  gym_id    UUID        NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (league_id, gym_id)
);

COMMENT ON TABLE public.league_gyms IS 'V3-06: which gyms have opted into which leagues.';

CREATE INDEX IF NOT EXISTS idx_league_gyms_gym ON public.league_gyms (gym_id);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_gyms ENABLE ROW LEVEL SECURITY;

-- READ: leagues + membership are a public directory for any authenticated user.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leagues'
                 AND policyname = 'Authenticated can read leagues') THEN
    CREATE POLICY "Authenticated can read leagues" ON public.leagues
      FOR SELECT TO authenticated USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'league_gyms'
                 AND policyname = 'Authenticated can read league memberships') THEN
    CREATE POLICY "Authenticated can read league memberships" ON public.league_gyms
      FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- Opt-in / opt-out go through RPCs (SECURITY DEFINER) — no direct write policy.

-- Directory: every active league + member count + whether the caller's gym is in it.
CREATE OR REPLACE FUNCTION public.league_directory()
RETURNS TABLE (
  id           uuid,
  name         text,
  slug         text,
  scope        text,
  region_code  text,
  member_count bigint,
  is_member    boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT l.id, l.name, l.slug, l.scope, l.region_code,
         (SELECT count(*) FROM public.league_gyms lg WHERE lg.league_id = l.id),
         EXISTS (
           SELECT 1 FROM public.league_gyms lg
           JOIN public.profiles p ON p.id = auth.uid()
           WHERE lg.league_id = l.id AND lg.gym_id = p.affiliated_gym_id
         )
  FROM public.leagues l
  WHERE l.status = 'active'
  ORDER BY l.scope, l.name;
$$;

-- Opt the caller's gym in. gym_admin (or platform_admin) only.
CREATE OR REPLACE FUNCTION public.join_league(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym uuid;
  v_mgr boolean;
BEGIN
  SELECT affiliated_gym_id, (role = 'gym_admin') INTO v_gym, v_mgr
  FROM public.profiles WHERE id = auth.uid();

  IF NOT (COALESCE(v_mgr, false) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'not_gym_admin';
  END IF;
  IF v_gym IS NULL THEN
    RAISE EXCEPTION 'no_gym';
  END IF;

  INSERT INTO public.league_gyms (league_id, gym_id)
  VALUES (p_league_id, v_gym)
  ON CONFLICT (league_id, gym_id) DO NOTHING;
END;
$$;

-- Opt the caller's gym out.
CREATE OR REPLACE FUNCTION public.leave_league(p_league_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym uuid;
  v_mgr boolean;
BEGIN
  SELECT affiliated_gym_id, (role = 'gym_admin') INTO v_gym, v_mgr
  FROM public.profiles WHERE id = auth.uid();

  IF NOT (COALESCE(v_mgr, false) OR public.is_platform_admin()) THEN
    RAISE EXCEPTION 'not_gym_admin';
  END IF;

  DELETE FROM public.league_gyms WHERE league_id = p_league_id AND gym_id = v_gym;
END;
$$;

GRANT EXECUTE ON FUNCTION public.league_directory() TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_league(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_league(uuid) TO authenticated;

-- Seed a couple of leagues so the opt-in flow is usable out of the box.
INSERT INTO public.leagues (name, slug, scope, region_code) VALUES
  ('TrueGrynd National', 'truegrynd-national', 'national', NULL),
  ('Île-de-France', 'ile-de-france', 'regional', 'IDF')
ON CONFLICT (slug) DO NOTHING;
