-- V2-06 PR2: public profile section visibility toggles (opt-out, default visible).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_division_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_rating_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_score_history_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_top_scores_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_badges_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_weeklies_on_public BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_finishers_on_public BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.show_division_on_public IS
  'When false, division tier and history are hidden on /app/u/[username].';
COMMENT ON COLUMN public.profiles.show_rating_on_public IS
  'When false, Truegrynd Rating card is hidden on the public profile.';
COMMENT ON COLUMN public.profiles.show_score_history_on_public IS
  'When false, validated score history is hidden on the public profile.';
COMMENT ON COLUMN public.profiles.show_top_scores_on_public IS
  'When false, top scores by axis are hidden on the public profile.';
COMMENT ON COLUMN public.profiles.show_badges_on_public IS
  'When false, streak and creator badges are hidden on the public profile.';
COMMENT ON COLUMN public.profiles.show_weeklies_on_public IS
  'When false, weekly challenge completions are hidden on the public profile.';
COMMENT ON COLUMN public.profiles.show_finishers_on_public IS
  'When false, finisher card gallery is hidden on the public profile.';
