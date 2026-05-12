-- Optional max clock time (seconds) for `score_type = time` challenges.
-- When set, the app rejects score submissions with value > max (UGC + official).

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS max_duration_seconds INT
  CHECK (max_duration_seconds IS NULL OR max_duration_seconds > 0);

COMMENT ON COLUMN public.challenges.max_duration_seconds IS
  'For time challenges: max allowed finish time in seconds (wall clock). NULL = no cap.';
