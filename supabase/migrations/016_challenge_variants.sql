-- V2-02: official challenge scaling variants (structured, not free text).

CREATE TABLE IF NOT EXISTS public.challenge_variants (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  variant      TEXT        NOT NULL CHECK (variant IN (
    'no_equipment', 'bodyweight', 'dumbbell', 'standard', 'savage'
  )),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (challenge_id, variant)
);

COMMENT ON TABLE public.challenge_variants IS
  'Official scaling lanes per challenge. Distinct from equipment_tags (descriptive tags).';

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS variant TEXT NOT NULL DEFAULT 'standard'
    CHECK (variant IN ('no_equipment', 'bodyweight', 'dumbbell', 'standard', 'savage'));

COMMENT ON COLUMN public.scores.variant IS
  'Official scaling lane for this submission. Must match a row in challenge_variants.';

INSERT INTO public.challenge_variants (challenge_id, variant)
SELECT c.id, 'standard'
FROM public.challenges c
WHERE NOT EXISTS (
  SELECT 1 FROM public.challenge_variants cv
  WHERE cv.challenge_id = c.id AND cv.variant = 'standard'
);

UPDATE public.scores SET variant = 'standard' WHERE variant IS NULL;

ALTER TABLE public.scores
  ADD CONSTRAINT scores_challenge_variant_fkey
  FOREIGN KEY (challenge_id, variant)
  REFERENCES public.challenge_variants (challenge_id, variant);

CREATE INDEX IF NOT EXISTS idx_challenge_variants_challenge
  ON public.challenge_variants (challenge_id);

CREATE INDEX IF NOT EXISTS idx_scores_challenge_variant
  ON public.scores (challenge_id, variant, is_validated);

ALTER TABLE public.challenge_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read variants for approved challenges"
  ON public.challenge_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.status = 'approved'
    )
  );

CREATE POLICY "Creators can read variants for own challenges"
  ON public.challenge_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id AND c.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all challenge variants"
  ON public.challenge_variants FOR SELECT
  TO authenticated
  USING (public.is_app_admin());

CREATE POLICY "Creators can insert variants for own pending challenges"
  ON public.challenge_variants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.challenges c
      WHERE c.id = challenge_id
        AND c.creator_id = auth.uid()
        AND c.status = 'pending'
    )
  );
