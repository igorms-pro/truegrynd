-- V3-09 slice 1: PLG "Trojan horse" loop. A free B2C athlete asks for their box to join
-- TrueGrynd; requests aggregate by gym (name+city) into leads the platform can act on.
-- Email-to-manager trigger is a follow-up; this slice = capture + aggregation. Additive.

CREATE TABLE IF NOT EXISTS public.gym_requests (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  gym_name   TEXT        NOT NULL CHECK (length(btrim(gym_name)) > 0),
  city       TEXT        NULL,
  normalized TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, normalized)
);

COMMENT ON TABLE public.gym_requests IS
  'V3-09: athlete demand for a gym to join TrueGrynd. normalized = lower name|city for lead aggregation.';

CREATE INDEX IF NOT EXISTS idx_gym_requests_normalized ON public.gym_requests (normalized);

ALTER TABLE public.gym_requests ENABLE ROW LEVEL SECURITY;

-- READ: a user sees their own requests; platform admins see all.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gym_requests'
                 AND policyname = 'Users read own gym requests') THEN
    CREATE POLICY "Users read own gym requests" ON public.gym_requests
      FOR SELECT TO authenticated
      USING (user_id = auth.uid() OR public.is_platform_admin());
  END IF;
END $$;

-- Writes go through submit_gym_request (normalizes + dedupes).

CREATE OR REPLACE FUNCTION public.submit_gym_request(p_gym_name text, p_city text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text := btrim(p_gym_name);
  v_city text := nullif(btrim(coalesce(p_city, '')), '');
  v_norm text;
BEGIN
  IF v_name IS NULL OR v_name = '' THEN
    RAISE EXCEPTION 'gym_name_required';
  END IF;
  v_norm := regexp_replace(lower(v_name), '\s+', ' ', 'g')
            || '|' || regexp_replace(lower(coalesce(v_city, '')), '\s+', ' ', 'g');

  INSERT INTO public.gym_requests (user_id, gym_name, city, normalized)
  VALUES (auth.uid(), v_name, v_city, v_norm)
  ON CONFLICT (user_id, normalized) DO NOTHING;
END;
$$;

-- Aggregated leads (platform admin only): one row per gym, sorted by demand.
CREATE OR REPLACE FUNCTION public.gym_request_leads()
RETURNS TABLE (
  normalized     text,
  gym_name       text,
  city           text,
  request_count  bigint,
  first_requested timestamptz,
  last_requested  timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;
  RETURN QUERY
    SELECT r.normalized,
           (array_agg(r.gym_name ORDER BY r.created_at DESC))[1],
           (array_agg(r.city ORDER BY r.created_at DESC))[1],
           count(*),
           min(r.created_at),
           max(r.created_at)
    FROM public.gym_requests r
    GROUP BY r.normalized
    ORDER BY count(*) DESC, max(r.created_at) DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_gym_request(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.gym_request_leads() TO authenticated;
