-- Migration: 004_score_respects.sql
-- Description: Add score_respects table for 👊 “respect” on scores
-- Dependencies: 001_initial_schema.sql, 002_rls_policies.sql

-- ============================================================================
-- SCORE_RESPECTS TABLE
-- One respect per (user, score). Used as a lightweight “like”.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.score_respects (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id   UUID        NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT score_respects_unique_per_user UNIQUE (score_id, user_id)
);

ALTER TABLE public.score_respects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_score_respects_score_id ON public.score_respects(score_id);
CREATE INDEX IF NOT EXISTS idx_score_respects_user_id ON public.score_respects(user_id);

COMMENT ON TABLE public.score_respects IS 'Per-user “respect” (like) on scores. One row per (user, score).';

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Anyone authenticated can see respects (for counters / UI).
CREATE POLICY "Authenticated users can read score respects"
  ON public.score_respects FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can add respect for their own user_id only.
CREATE POLICY "Users can insert own score respects"
  ON public.score_respects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own respects.
CREATE POLICY "Users can delete own score respects"
  ON public.score_respects FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

