-- UGC: creators can read their own challenges (any status). Everyone still reads approved via existing policy.
-- Scores: only insert when target challenge is approved (prevents ranking on pending UGC).

CREATE POLICY "Creators can read own challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

COMMENT ON POLICY "Creators can read own challenges" ON public.challenges IS
  'Lets creators view pending/rejected UGC they submitted; public feed remains approved-only via OR with existing SELECT policy.';

DROP POLICY IF EXISTS "Users can insert own scores" ON public.scores;

CREATE POLICY "Users can insert own scores for approved challenges"
  ON public.scores FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.challenges c
      WHERE c.id = challenge_id
        AND c.status = 'approved'
    )
  );
