-- V2-05: Truegrynd Rating — axes, profile_ratings snapshot, history, recalc trigger, division promotion.

-- Prerequisite: profiles.division (V2-01 / migration 015) — safe if 015 already applied.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'rookie';

UPDATE public.profiles
SET division = 'rookie'
WHERE division IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_division_check'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_division_check
      CHECK (division IN ('rookie', 'regular', 'savage', 'elite'));
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_profiles_division ON public.profiles(division);

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS rating_axis TEXT NOT NULL DEFAULT 'engine'
    CHECK (rating_axis IN ('engine', 'power', 'strength', 'grit'));

COMMENT ON COLUMN public.challenges.rating_axis IS
  'Primary rating axis for validated score percentiles. Consistency is profile-only (streak + activity).';

UPDATE public.challenges
SET rating_axis = CASE
  WHEN score_type = 'time' AND max_duration_seconds IS NOT NULL AND max_duration_seconds >= 300 THEN 'grit'
  WHEN score_type = 'time' THEN 'engine'
  WHEN equipment_tags && ARRAY['box', 'plyo', 'medicine_ball']::text[] THEN 'power'
  WHEN equipment_tags && ARRAY['barbell', 'dumbbell', 'kettlebell']::text[] THEN 'strength'
  WHEN score_type = 'reps' THEN 'strength'
  ELSE 'engine'
END;

CREATE TABLE IF NOT EXISTS public.profile_ratings (
  user_id                 UUID           PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_global           NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_global >= 0 AND rating_global <= 100),
  rating_engine           NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_engine >= 0 AND rating_engine <= 100),
  rating_power            NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_power >= 0 AND rating_power <= 100),
  rating_strength         NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_strength >= 0 AND rating_strength <= 100),
  rating_grit             NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_grit >= 0 AND rating_grit <= 100),
  rating_consistency      NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (rating_consistency >= 0 AND rating_consistency <= 100),
  validated_score_count   INT            NOT NULL DEFAULT 0 CHECK (validated_score_count >= 0),
  computed_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profile_ratings IS
  'Cached Truegrynd Rating snapshot per user. Recalculated on validated score submission.';

CREATE TABLE IF NOT EXISTS public.profile_rating_history (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID           NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating_global  NUMERIC(5, 2)  NOT NULL CHECK (rating_global >= 0 AND rating_global <= 100),
  division       TEXT           NOT NULL CHECK (division IN ('rookie', 'regular', 'savage', 'elite')),
  recorded_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_rating_history_user_recorded
  ON public.profile_rating_history(user_id, recorded_at DESC);

ALTER TABLE public.profile_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_rating_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read profile ratings"
  ON public.profile_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone authenticated can read profile rating history"
  ON public.profile_rating_history FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.resolve_division_from_rating(
  p_current_division TEXT,
  p_global NUMERIC,
  p_validated_count INT,
  p_engine NUMERIC,
  p_power NUMERIC,
  p_strength NUMERIC,
  p_grit NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_candidate TEXT := 'rookie';
  v_min_axis NUMERIC;
  v_current_idx INT;
  v_candidate_idx INT;
BEGIN
  IF p_validated_count >= 8 AND p_global >= 82 THEN
    SELECT MIN(v)
    INTO v_min_axis
    FROM (VALUES (p_engine), (p_power), (p_strength), (p_grit)) AS axes(v)
    WHERE v > 0;

    IF v_min_axis IS NOT NULL AND v_min_axis >= 45 THEN
      v_candidate := 'elite';
    END IF;
  END IF;

  IF v_candidate = 'rookie' AND p_validated_count >= 5 AND p_global >= 60 THEN
    v_candidate := 'savage';
  ELSIF v_candidate = 'rookie' AND p_validated_count >= 3 AND p_global >= 35 THEN
    v_candidate := 'regular';
  END IF;

  v_current_idx := CASE p_current_division
    WHEN 'regular' THEN 2
    WHEN 'savage' THEN 3
    WHEN 'elite' THEN 4
    ELSE 1
  END;

  v_candidate_idx := CASE v_candidate
    WHEN 'regular' THEN 2
    WHEN 'savage' THEN 3
    WHEN 'elite' THEN 4
    ELSE 1
  END;

  IF v_candidate_idx > v_current_idx THEN
    RETURN v_candidate;
  END IF;

  RETURN p_current_division;
END;
$$;

COMMENT ON FUNCTION public.resolve_division_from_rating IS
  'One-way division promotion from rating snapshot. Sync with src/lib/rating/divisionFromRating.ts.';

CREATE OR REPLACE FUNCTION public.recalculate_profile_rating(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  v_streak INT := 0;
  v_validated_30d INT := 0;
  v_engine_sum NUMERIC := 0;
  v_power_sum NUMERIC := 0;
  v_strength_sum NUMERIC := 0;
  v_grit_sum NUMERIC := 0;
  v_engine_count INT := 0;
  v_power_count INT := 0;
  v_strength_count INT := 0;
  v_grit_count INT := 0;
  v_total INT;
  v_better INT;
  v_percentile NUMERIC;
  v_engine NUMERIC(5, 2) := 0;
  v_power NUMERIC(5, 2) := 0;
  v_strength NUMERIC(5, 2) := 0;
  v_grit NUMERIC(5, 2) := 0;
  v_consistency NUMERIC(5, 2) := 0;
  v_global NUMERIC(5, 2) := 0;
  v_count INT := 0;
  v_axis_total NUMERIC := 0;
  v_axis_count INT := 0;
  v_old_global NUMERIC(5, 2) := 0;
  v_old_division TEXT := 'rookie';
  v_new_division TEXT := 'rookie';
BEGIN
  SELECT streak_days, division
  INTO v_streak, v_old_division
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT rating_global
  INTO v_old_global
  FROM public.profile_ratings
  WHERE user_id = p_user_id;

  SELECT COUNT(*)
  INTO v_validated_30d
  FROM public.scores
  WHERE user_id = p_user_id
    AND is_validated = true
    AND submitted_at >= NOW() - INTERVAL '30 days';

  FOR rec IN
    WITH best_scores AS (
      SELECT DISTINCT ON (s.challenge_id)
        s.challenge_id,
        s.value,
        c.score_type,
        c.rating_axis
      FROM public.scores s
      JOIN public.challenges c ON c.id = s.challenge_id
      WHERE s.user_id = p_user_id
        AND s.is_validated = true
      ORDER BY s.challenge_id,
        CASE WHEN c.score_type = 'time' THEN s.value END ASC NULLS LAST,
        CASE WHEN c.score_type = 'reps' THEN s.value END DESC NULLS LAST
    )
    SELECT * FROM best_scores
  LOOP
    v_count := v_count + 1;

    SELECT COUNT(*)
    INTO v_total
    FROM public.scores
    WHERE challenge_id = rec.challenge_id
      AND is_validated = true;

    IF rec.score_type = 'time' THEN
      SELECT COUNT(*)
      INTO v_better
      FROM public.scores
      WHERE challenge_id = rec.challenge_id
        AND is_validated = true
        AND value < rec.value;
    ELSE
      SELECT COUNT(*)
      INTO v_better
      FROM public.scores
      WHERE challenge_id = rec.challenge_id
        AND is_validated = true
        AND value > rec.value;
    END IF;

    v_percentile := ROUND((1 - (v_better::NUMERIC / GREATEST(v_total, 1))) * 100, 2);

    IF rec.rating_axis = 'engine' THEN
      v_engine_sum := v_engine_sum + v_percentile;
      v_engine_count := v_engine_count + 1;
    ELSIF rec.rating_axis = 'power' THEN
      v_power_sum := v_power_sum + v_percentile;
      v_power_count := v_power_count + 1;
    ELSIF rec.rating_axis = 'strength' THEN
      v_strength_sum := v_strength_sum + v_percentile;
      v_strength_count := v_strength_count + 1;
    ELSIF rec.rating_axis = 'grit' THEN
      v_grit_sum := v_grit_sum + v_percentile;
      v_grit_count := v_grit_count + 1;
    END IF;
  END LOOP;

  IF v_engine_count > 0 THEN
    v_engine := ROUND(v_engine_sum / v_engine_count, 2);
  END IF;
  IF v_power_count > 0 THEN
    v_power := ROUND(v_power_sum / v_power_count, 2);
  END IF;
  IF v_strength_count > 0 THEN
    v_strength := ROUND(v_strength_sum / v_strength_count, 2);
  END IF;
  IF v_grit_count > 0 THEN
    v_grit := ROUND(v_grit_sum / v_grit_count, 2);
  END IF;

  v_consistency := ROUND(
    LEAST(GREATEST(v_streak, 0), 21) / 21.0 * 50
    + LEAST(GREATEST(v_validated_30d, 0), 6) / 6.0 * 50,
    2
  );

  IF v_engine > 0 THEN
    v_axis_total := v_axis_total + v_engine;
    v_axis_count := v_axis_count + 1;
  END IF;
  IF v_power > 0 THEN
    v_axis_total := v_axis_total + v_power;
    v_axis_count := v_axis_count + 1;
  END IF;
  IF v_strength > 0 THEN
    v_axis_total := v_axis_total + v_strength;
    v_axis_count := v_axis_count + 1;
  END IF;
  IF v_grit > 0 THEN
    v_axis_total := v_axis_total + v_grit;
    v_axis_count := v_axis_count + 1;
  END IF;
  IF v_consistency > 0 THEN
    v_axis_total := v_axis_total + v_consistency;
    v_axis_count := v_axis_count + 1;
  END IF;

  IF v_axis_count > 0 THEN
    v_global := ROUND(v_axis_total / v_axis_count, 2);
  END IF;

  v_new_division := public.resolve_division_from_rating(
    v_old_division,
    v_global,
    v_count,
    v_engine,
    v_power,
    v_strength,
    v_grit
  );

  INSERT INTO public.profile_ratings (
    user_id,
    rating_global,
    rating_engine,
    rating_power,
    rating_strength,
    rating_grit,
    rating_consistency,
    validated_score_count,
    computed_at
  )
  VALUES (
    p_user_id,
    v_global,
    v_engine,
    v_power,
    v_strength,
    v_grit,
    v_consistency,
    v_count,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    rating_global = EXCLUDED.rating_global,
    rating_engine = EXCLUDED.rating_engine,
    rating_power = EXCLUDED.rating_power,
    rating_strength = EXCLUDED.rating_strength,
    rating_grit = EXCLUDED.rating_grit,
    rating_consistency = EXCLUDED.rating_consistency,
    validated_score_count = EXCLUDED.validated_score_count,
    computed_at = EXCLUDED.computed_at;

  PERFORM set_config('app.server_managed_update', 'true', true);

  UPDATE public.profiles
  SET division = v_new_division
  WHERE id = p_user_id
    AND division IS DISTINCT FROM v_new_division;

  IF v_new_division IS DISTINCT FROM v_old_division
     OR ABS(COALESCE(v_global, 0) - COALESCE(v_old_global, 0)) >= 5 THEN
    INSERT INTO public.profile_rating_history (user_id, rating_global, division)
    VALUES (p_user_id, v_global, v_new_division);
  END IF;
END;
$$;

COMMENT ON FUNCTION public.recalculate_profile_rating IS
  'Recompute cached Truegrynd Rating and apply one-way division promotion. Sync with src/lib/rating/*.';

CREATE OR REPLACE FUNCTION public.recalculate_profile_rating_on_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT NEW.is_validated THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_validated THEN
    RETURN NEW;
  END IF;

  PERFORM public.recalculate_profile_rating(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_score_recalculate_rating
  AFTER INSERT OR UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_profile_rating_on_score();

CREATE OR REPLACE FUNCTION public.guard_server_managed_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.server_managed_update', true) IS DISTINCT FROM 'true' THEN
    NEW.creator_score := OLD.creator_score;
    NEW.streak_days := OLD.streak_days;
    NEW.last_activity_at := OLD.last_activity_at;
    NEW.division := OLD.division;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON COLUMN public.profiles.division IS
  'Competitive skill division. Default rookie at signup; auto-promoted via V2-05 rating (one-way).';

-- Backfill ratings for users with validated scores.
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT user_id
    FROM public.scores
    WHERE is_validated = true
  LOOP
    PERFORM public.recalculate_profile_rating(v_user_id);
  END LOOP;
END;
$$;
