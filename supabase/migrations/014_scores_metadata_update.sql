-- Allow users to update proof URL and hide scores from profile card carousel.
-- Performance fields (value, is_validated, challenge_id, etc.) stay immutable.

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.scores.is_hidden IS
  'When true, score is omitted from profile finisher card carousel; still in history and leaderboard logic.';

CREATE OR REPLACE FUNCTION public.scores_update_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.challenge_id IS DISTINCT FROM OLD.challenge_id
     OR NEW.value IS DISTINCT FROM OLD.value
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
  THEN
    RAISE EXCEPTION 'scores_immutable_except_metadata';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scores_update_guard_trigger ON public.scores;
CREATE TRIGGER scores_update_guard_trigger
  BEFORE UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_update_guard();

CREATE POLICY "Users can update own score metadata"
  ON public.scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
