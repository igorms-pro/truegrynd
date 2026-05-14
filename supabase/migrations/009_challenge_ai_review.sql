-- AI-assisted triage for pending UGC challenges (admin-triggered; never auto-approve).

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS ai_tier TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_model TEXT NULL,
  ADD COLUMN IF NOT EXISTS ai_checked_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN public.challenges.ai_tier IS 'Moderation triage: green / orange / red; NULL = not analyzed yet.';
COMMENT ON COLUMN public.challenges.ai_summary IS 'Short model-written summary for admin queue (no PII).';
COMMENT ON COLUMN public.challenges.ai_model IS 'Model id used for the last review.';
COMMENT ON COLUMN public.challenges.ai_checked_at IS 'When ai_* was last written.';

ALTER TABLE public.challenges DROP CONSTRAINT IF EXISTS challenges_ai_tier_check;
ALTER TABLE public.challenges
  ADD CONSTRAINT challenges_ai_tier_check
  CHECK (ai_tier IS NULL OR ai_tier IN ('green', 'orange', 'red'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'challenges'
      AND column_name = 'ai_tier_rank'
  ) THEN
    ALTER TABLE public.challenges
      ADD COLUMN ai_tier_rank SMALLINT
      GENERATED ALWAYS AS (
        CASE ai_tier
          WHEN 'red' THEN 1
          WHEN 'orange' THEN 2
          WHEN 'green' THEN 3
          ELSE 4
        END
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_challenges_pending_ai_rank
  ON public.challenges (status, ai_tier_rank ASC, created_at ASC)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION public.admin_apply_challenge_ai_review(
  p_challenge_id uuid,
  p_tier text,
  p_summary text,
  p_model text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_tier IS NOT NULL AND p_tier NOT IN ('green', 'orange', 'red') THEN
    RAISE EXCEPTION 'invalid_ai_tier';
  END IF;

  UPDATE public.challenges
  SET
    ai_tier = p_tier,
    ai_summary = NULLIF(trim(p_summary), ''),
    ai_model = NULLIF(trim(p_model), ''),
    ai_checked_at = now()
  WHERE id = p_challenge_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'challenge_not_pending';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.admin_apply_challenge_ai_review IS 'Admin only: persist AI triage fields on a pending challenge.';

DROP FUNCTION IF EXISTS public.admin_batch_approve_challenges(uuid[]);

CREATE OR REPLACE FUNCTION public.admin_batch_approve_challenges(
  p_ids uuid[],
  p_only_green boolean DEFAULT false
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  IF p_ids IS NULL OR cardinality(p_ids) = 0 THEN
    RETURN 0;
  END IF;

  IF cardinality(p_ids) > 50 THEN
    RAISE EXCEPTION 'batch_limit_exceeded';
  END IF;

  UPDATE public.challenges
  SET
    status = 'approved',
    rejection_reason = NULL,
    reviewed_at = now(),
    reviewed_by = auth.uid()
  WHERE id = ANY (p_ids)
    AND status = 'pending'
    AND (
      NOT p_only_green
      OR ai_tier = 'green'
    );

  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

COMMENT ON FUNCTION public.admin_batch_approve_challenges IS 'Admin only: approve up to 50 pending challenges; optional green-tier-only guard.';

REVOKE ALL ON FUNCTION public.admin_apply_challenge_ai_review(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_apply_challenge_ai_review(uuid, text, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_batch_approve_challenges(uuid[], boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_batch_approve_challenges(uuid[], boolean) TO authenticated;
