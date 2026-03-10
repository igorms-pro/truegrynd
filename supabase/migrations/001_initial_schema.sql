-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Truegrynd – async fitness competition platform
-- Dependencies: none

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE (extends auth.users)
-- Created via trigger on auth.users insert; enriched during onboarding.
-- username/sex/age/weight_kg are NULL until onboarding is complete.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      TEXT        UNIQUE,
  sex           TEXT        CHECK (sex IN ('male', 'female', 'other')),
  age           INT         CHECK (age > 0 AND age < 120),
  weight_kg     NUMERIC(5, 2) CHECK (weight_kg > 0 AND weight_kg < 500),
  faction       TEXT        CHECK (faction IN ('nomads', 'horde', 'iron_alliance')),
  initiation_completed BOOLEAN NOT NULL DEFAULT FALSE,
  creator_score INT         NOT NULL DEFAULT 0,
  streak_days   INT         NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_faction  ON public.profiles(faction);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users. Enriched during onboarding.';
COMMENT ON COLUMN public.profiles.username IS 'Unique display name. NULL until onboarding step 1 completed.';
COMMENT ON COLUMN public.profiles.initiation_completed IS 'Set to true after completing 3 initiation challenges.';

-- ============================================================================
-- CHALLENGES TABLE
-- Official challenges seeded; UGC post-MVP.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT        NOT NULL,
  description    TEXT        NOT NULL,
  rules          TEXT        NOT NULL,
  score_type     TEXT        NOT NULL CHECK (score_type IN ('time', 'reps')),
  equipment_tags TEXT[]      NOT NULL DEFAULT '{}',
  is_official    BOOLEAN     NOT NULL DEFAULT FALSE,
  status         TEXT        NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  creator_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_challenges_status     ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_official   ON public.challenges(is_official);
CREATE INDEX IF NOT EXISTS idx_challenges_score_type ON public.challenges(score_type);
CREATE INDEX IF NOT EXISTS idx_challenges_creator    ON public.challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created    ON public.challenges(created_at);

COMMENT ON TABLE public.challenges IS 'Standardized fitness challenges. Official ones are seeded; UGC post-MVP.';
COMMENT ON COLUMN public.challenges.score_type IS 'time = lower is better (seconds); reps = higher is better (integer).';
COMMENT ON COLUMN public.challenges.equipment_tags IS 'e.g. {kettlebell, pull-up bar}. Empty array = bodyweight.';

-- ============================================================================
-- SCORES TABLE
-- Multiple attempts per user per challenge are allowed; app surfaces best score.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scores (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID        NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value        NUMERIC     NOT NULL CHECK (value > 0),
  video_url    TEXT,
  is_validated BOOLEAN     NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_scores_challenge_id  ON public.scores(challenge_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_id       ON public.scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_validated     ON public.scores(challenge_id, is_validated);
CREATE INDEX IF NOT EXISTS idx_scores_submitted     ON public.scores(challenge_id, submitted_at DESC);

COMMENT ON TABLE public.scores IS 'Score submissions. Multiple attempts allowed per user per challenge.';
COMMENT ON COLUMN public.scores.value IS 'Seconds (time challenges) or integer reps. Always stored as NUMERIC.';
COMMENT ON COLUMN public.scores.is_validated IS 'False if top-10% score submitted without video_url.';

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Generic updated_at trigger function (reused across tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create a minimal profile row when a new auth user signs up.
-- username and biometric fields stay NULL until onboarding fills them in.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
