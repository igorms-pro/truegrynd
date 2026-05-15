-- Creator Score: auto-increment when a validated score is submitted on a challenge
-- owned by another user. +1 per validated score, daily cap of 10 per creator.
-- Self-scores do not count. Only approved challenges qualify.

-- Guard: silently revert client-side writes to server-managed fields on profiles.
-- Uses a transaction-local GUC flag so that SECURITY DEFINER triggers can bypass.
CREATE OR REPLACE FUNCTION public.guard_server_managed_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.server_managed_update', true) IS DISTINCT FROM 'true' THEN
    NEW.creator_score := OLD.creator_score;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.guard_server_managed_profile_fields IS
  'Prevents client-side mutation of creator_score. Server triggers set app.server_managed_update=true to bypass.';

CREATE TRIGGER guard_profile_server_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_server_managed_profile_fields();

-- Increment trigger on scores table
CREATE OR REPLACE FUNCTION public.increment_creator_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_creator_id UUID;
  v_daily_count INT;
  v_daily_cap CONSTANT INT := 10;
BEGIN
  IF NOT NEW.is_validated THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_validated THEN
    RETURN NEW;
  END IF;

  SELECT creator_id INTO v_creator_id
  FROM public.challenges
  WHERE id = NEW.challenge_id
    AND status = 'approved'
    AND creator_id IS NOT NULL;

  IF v_creator_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF v_creator_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_daily_count
  FROM public.scores s
  JOIN public.challenges c ON c.id = s.challenge_id
  WHERE c.creator_id = v_creator_id
    AND s.is_validated = true
    AND s.user_id != v_creator_id
    AND s.submitted_at::date = CURRENT_DATE
    AND s.id != NEW.id;

  IF v_daily_count >= v_daily_cap THEN
    RETURN NEW;
  END IF;

  PERFORM set_config('app.server_managed_update', 'true', true);

  UPDATE public.profiles
  SET creator_score = creator_score + 1
  WHERE id = v_creator_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.increment_creator_score IS
  'Auto-increment creator_score when someone submits a validated score on an approved challenge. Daily cap: 10. Self-scores excluded.';

CREATE TRIGGER on_score_increment_creator
  AFTER INSERT OR UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_creator_score();
