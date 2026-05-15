-- Streaks: auto-update streak_days + last_activity_at on score submission.
-- Rule: ≥1 score per calendar day (UTC) extends the streak.
-- Gap > 1 day → streak resets to 1. Same-day = idempotent (no double increment).

CREATE OR REPLACE FUNCTION public.update_streak_on_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date DATE;
  v_today     DATE := CURRENT_DATE;
  v_streak    INT;
BEGIN
  SELECT last_activity_at::date, streak_days
  INTO v_last_date, v_streak
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF v_last_date IS NOT NULL AND v_last_date = v_today THEN
    RETURN NEW;
  END IF;

  IF v_last_date IS NOT NULL AND v_last_date = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  PERFORM set_config('app.server_managed_update', 'true', true);

  UPDATE public.profiles
  SET streak_days = v_streak,
      last_activity_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_streak_on_score IS
  'Auto-update streak on score submission. Idempotent per day (UTC). Resets after >1 day gap.';

CREATE TRIGGER on_score_update_streak
  AFTER INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_score();

-- Protect streak_days + last_activity_at from client writes (extend existing guard)
CREATE OR REPLACE FUNCTION public.guard_server_managed_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.server_managed_update', true) IS DISTINCT FROM 'true' THEN
    NEW.creator_score := OLD.creator_score;
    NEW.streak_days := OLD.streak_days;
    NEW.last_activity_at := OLD.last_activity_at;
  END IF;
  RETURN NEW;
END;
$$;
