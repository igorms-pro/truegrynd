-- V3-02: link a score to the coach who judge-verified it.
-- Additive & non-breaking. Reuses the EXISTING proof_level enum (027) — does NOT recreate it.
-- video_url (001) already covers the "proof_url" need, so no new proof column.
-- The actual coach-validation flow (set proof_level = 'judge_verified') lands in V3-03 (Judge Console).

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS verified_by_coach_id UUID NULL
    REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.scores.verified_by_coach_id IS
  'V3-02: the coach/gym_admin who judge-verified this score (NULL = not judge-verified). Set when proof_level becomes judge_verified.';

-- Lookup: a coach''s validated scores, and "who verified this".
CREATE INDEX IF NOT EXISTS idx_scores_verified_by_coach
  ON public.scores (verified_by_coach_id)
  WHERE verified_by_coach_id IS NOT NULL;
