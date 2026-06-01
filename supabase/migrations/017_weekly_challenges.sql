-- V2-03: one global challenge window per week (admin-scheduled, no deploy).

CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE RESTRICT,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  week_label   TEXT        NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT weekly_challenges_window_check CHECK (ends_at > starts_at)
);

COMMENT ON TABLE public.weekly_challenges IS
  'V2-03: global weekly challenge window. Linked to an approved challenge; admin-managed via RPC.';

CREATE INDEX IF NOT EXISTS idx_weekly_challenges_window
  ON public.weekly_challenges (starts_at DESC, ends_at DESC)
  WHERE status <> 'cancelled';

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read weekly challenges"
  ON public.weekly_challenges FOR SELECT
  TO authenticated
  USING (status <> 'cancelled');

CREATE POLICY "Admins can insert weekly challenges"
  ON public.weekly_challenges FOR INSERT
  TO authenticated
  WITH CHECK (public.is_app_admin());

CREATE POLICY "Admins can update weekly challenges"
  ON public.weekly_challenges FOR UPDATE
  TO authenticated
  USING (public.is_app_admin())
  WITH CHECK (public.is_app_admin());

CREATE OR REPLACE FUNCTION public.admin_upsert_weekly_challenge(
  p_id uuid,
  p_challenge_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_status text DEFAULT 'scheduled',
  p_week_label text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_label text;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'invalid_window';
  END IF;

  IF p_status NOT IN ('scheduled', 'active', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = p_challenge_id AND c.status = 'approved'
  ) THEN
    RAISE EXCEPTION 'challenge_not_approved';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.weekly_challenges w
    WHERE w.status <> 'cancelled'
      AND (p_id IS NULL OR w.id <> p_id)
      AND w.starts_at < p_ends_at
      AND w.ends_at > p_starts_at
  ) THEN
    RAISE EXCEPTION 'overlapping_window';
  END IF;

  v_label := NULLIF(TRIM(p_week_label), '');

  IF p_id IS NULL THEN
    INSERT INTO public.weekly_challenges (
      challenge_id, starts_at, ends_at, status, week_label
    )
    VALUES (p_challenge_id, p_starts_at, p_ends_at, p_status, v_label)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.weekly_challenges
    SET
      challenge_id = p_challenge_id,
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      status = p_status,
      week_label = v_label,
      updated_at = NOW()
    WHERE id = p_id
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RAISE EXCEPTION 'weekly_not_found';
    END IF;
  END IF;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.admin_upsert_weekly_challenge IS
  'Admin only: create or update a weekly challenge window (no deploy).';

REVOKE ALL ON FUNCTION public.admin_upsert_weekly_challenge(
  uuid, uuid, timestamptz, timestamptz, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_weekly_challenge(
  uuid, uuid, timestamptz, timestamptz, text, text
) TO authenticated;
