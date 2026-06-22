-- V3-04: KYB — a gym is a VERIFIED legal entity (SIREN/SIRET), not a free-form record.
-- Self-serve gym creation is gated behind business verification (recherche-entreprises API,
-- done server-side in the `create-gym` Edge Function). This keeps the verified-ranking moat
-- credible: every gym maps to a real company. Additive & non-breaking.

-- 1. Legal-identity columns on gyms (all NULL for pre-V3-04 rows).
ALTER TABLE public.gyms
  ADD COLUMN IF NOT EXISTS siren       TEXT        NULL,
  ADD COLUMN IF NOT EXISTS siret       TEXT        NULL,
  ADD COLUMN IF NOT EXISTS legal_name  TEXT        NULL,
  ADD COLUMN IF NOT EXISTS naf_code    TEXT        NULL,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.gyms.siren IS
  'V3-04: 9-digit SIREN of the owning legal entity (KYB). Unique — one gym per company.';
COMMENT ON COLUMN public.gyms.verified_at IS
  'V3-04: when the SIREN/SIRET was verified against the public business registry.';

-- One gym per legal entity (partial: legacy rows with NULL siren are unaffected).
CREATE UNIQUE INDEX IF NOT EXISTS idx_gyms_siren_unique
  ON public.gyms (siren) WHERE siren IS NOT NULL;

-- 2. Trusted creation path. SECURITY DEFINER so it can insert the gym AND promote the
-- caller to gym_admin in one transaction. Granted to service_role ONLY: the sole caller is
-- the `create-gym` Edge Function, which has already verified the SIREN against the registry.
-- A client cannot reach this directly, so an unverified SIREN can never be persisted.
CREATE OR REPLACE FUNCTION public.create_verified_gym(
  p_owner      uuid,
  p_name       text,
  p_siren      text,
  p_siret      text,
  p_legal_name text,
  p_naf        text,
  p_city       text,
  p_country    text DEFAULT 'FR'
)
RETURNS public.gyms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gym  public.gyms;
  v_base text;
  v_slug text;
  v_n    int := 1;
BEGIN
  IF p_owner IS NULL THEN
    RAISE EXCEPTION 'no_owner';
  END IF;
  IF p_siren IS NULL OR p_siren !~ '^\d{9}$' THEN
    RAISE EXCEPTION 'invalid_siren';
  END IF;
  IF EXISTS (SELECT 1 FROM public.gyms WHERE siren = p_siren) THEN
    RAISE EXCEPTION 'gym_already_claimed';
  END IF;

  -- Build a unique URL slug from the (legal) name.
  v_base := btrim(regexp_replace(lower(coalesce(nullif(btrim(p_name), ''), 'gym')), '[^a-z0-9]+', '-', 'g'), '-');
  IF v_base = '' THEN
    v_base := 'gym';
  END IF;
  v_slug := v_base;
  WHILE EXISTS (SELECT 1 FROM public.gyms WHERE slug = v_slug) LOOP
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  END LOOP;

  INSERT INTO public.gyms (name, slug, owner_id, city, country_code,
                           siren, siret, legal_name, naf_code, verified_at)
  VALUES (coalesce(nullif(btrim(p_name), ''), p_legal_name), v_slug, p_owner, p_city, p_country,
          p_siren, p_siret, p_legal_name, p_naf, NOW())
  RETURNING * INTO v_gym;

  -- Promote the claimer to gym_admin (never downgrade a platform_admin) and affiliate them.
  UPDATE public.profiles
  SET role = CASE WHEN role IN ('athlete', 'coach') THEN 'gym_admin'::public.user_role ELSE role END,
      affiliated_gym_id = v_gym.id
  WHERE id = p_owner;

  RETURN v_gym;
END;
$$;

COMMENT ON FUNCTION public.create_verified_gym IS
  'V3-04: create a KYB-verified gym + promote the owner to gym_admin. Service-role only; '
  'the create-gym Edge Function verifies the SIREN before calling this.';

REVOKE ALL ON FUNCTION public.create_verified_gym(uuid, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_verified_gym(uuid, text, text, text, text, text, text, text) TO service_role;
