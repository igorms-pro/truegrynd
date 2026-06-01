-- V2-10: proof levels on scores (honor → video_ranked → community → event → judge).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proof_level') THEN
    CREATE TYPE public.proof_level AS ENUM (
      'honor',
      'video_ranked',
      'community_verified',
      'event_verified',
      'judge_verified'
    );
  END IF;
END $$;

ALTER TABLE public.scores
  ADD COLUMN IF NOT EXISTS proof_level public.proof_level NOT NULL DEFAULT 'honor';

COMMENT ON COLUMN public.scores.proof_level IS
  'V2-10: credibility tier. honor = saved only; video_ranked+ appears on prestige leaderboards when validated.';

CREATE INDEX IF NOT EXISTS idx_scores_proof_level
  ON public.scores (challenge_id, proof_level)
  WHERE is_validated = true;

UPDATE public.scores
SET proof_level = 'video_ranked'
WHERE is_validated = true
  AND proof_level = 'honor';

CREATE TABLE IF NOT EXISTS public.score_proof_audits (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id        UUID            NOT NULL REFERENCES public.scores(id) ON DELETE CASCADE,
  previous_level  public.proof_level NOT NULL,
  new_level       public.proof_level NOT NULL,
  actor_id        UUID            NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  source          TEXT            NOT NULL CHECK (source IN ('system', 'admin', 'community_respects', 'event')),
  note            TEXT            NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_score_proof_audits_score
  ON public.score_proof_audits (score_id, created_at DESC);

ALTER TABLE public.score_proof_audits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'score_proof_audits'
      AND policyname = 'Admins can read score proof audits'
  ) THEN
    CREATE POLICY "Admins can read score proof audits"
      ON public.score_proof_audits FOR SELECT
      TO authenticated
      USING (public.is_app_admin());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.proof_level_rank(p_level public.proof_level)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_level
    WHEN 'honor' THEN 0
    WHEN 'video_ranked' THEN 1
    WHEN 'community_verified' THEN 2
    WHEN 'event_verified' THEN 3
    WHEN 'judge_verified' THEN 4
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.log_score_proof_change(
  p_score_id UUID,
  p_previous public.proof_level,
  p_new public.proof_level,
  p_source TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_previous IS NOT DISTINCT FROM p_new THEN
    RETURN;
  END IF;

  INSERT INTO public.score_proof_audits (
    score_id, previous_level, new_level, actor_id, source, note
  )
  VALUES (p_score_id, p_previous, p_new, p_actor_id, p_source, NULLIF(TRIM(p_note), ''));
END;
$$;

CREATE OR REPLACE FUNCTION public.upgrade_score_proof_level(
  p_score_id UUID,
  p_new_level public.proof_level,
  p_source TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.proof_level;
BEGIN
  SELECT proof_level INTO v_old FROM public.scores WHERE id = p_score_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF public.proof_level_rank(p_new_level) <= public.proof_level_rank(v_old) THEN
    RETURN;
  END IF;

  PERFORM set_config('tg.proof_bypass', '1', true);

  UPDATE public.scores
  SET proof_level = p_new_level
  WHERE id = p_score_id;

  PERFORM public.log_score_proof_change(p_score_id, v_old, p_new_level, p_source, p_actor_id, p_note);
END;
$$;

CREATE OR REPLACE FUNCTION public.scores_proof_level_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_validated AND NEW.video_url IS NOT NULL THEN
      NEW.proof_level := 'video_ranked';
    ELSE
      NEW.proof_level := 'honor';
    END IF;
    RETURN NEW;
  END IF;

  IF current_setting('tg.proof_bypass', true) = '1' THEN
    RETURN NEW;
  END IF;

  IF NEW.proof_level IS DISTINCT FROM OLD.proof_level THEN
    RAISE EXCEPTION 'proof_level_immutable';
  END IF;

  IF NOT OLD.is_validated
     AND NEW.is_validated
     AND NEW.video_url IS NOT NULL
     AND public.proof_level_rank(OLD.proof_level) < public.proof_level_rank('video_ranked'::public.proof_level)
  THEN
    PERFORM set_config('tg.proof_bypass', '1', true);
    NEW.proof_level := 'video_ranked';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS scores_proof_level_guard_trigger ON public.scores;
CREATE TRIGGER scores_proof_level_guard_trigger
  BEFORE INSERT OR UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_proof_level_guard();

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

CREATE OR REPLACE FUNCTION public.maybe_community_verify_score(p_score_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_level public.proof_level;
BEGIN
  SELECT COUNT(*)::INT INTO v_count
  FROM public.score_respects
  WHERE score_id = p_score_id;

  IF v_count < 5 THEN
    RETURN;
  END IF;

  SELECT proof_level INTO v_level FROM public.scores WHERE id = p_score_id;
  IF v_level IS NULL OR public.proof_level_rank(v_level) < public.proof_level_rank('video_ranked'::public.proof_level) THEN
    RETURN;
  END IF;

  PERFORM public.upgrade_score_proof_level(
    p_score_id,
    'community_verified',
    'community_respects',
    NULL,
    'Auto: 5+ respects'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.on_respect_community_proof()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.maybe_community_verify_score(NEW.score_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_respect_community_proof ON public.score_respects;
CREATE TRIGGER on_respect_community_proof
  AFTER INSERT ON public.score_respects
  FOR EACH ROW
  EXECUTE FUNCTION public.on_respect_community_proof();

CREATE OR REPLACE FUNCTION public.on_event_score_proof()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.score_id IS NOT NULL THEN
    PERFORM public.upgrade_score_proof_level(
      NEW.score_id,
      'event_verified',
      'event',
      NULL,
      'Score linked to micro-event'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_score_proof ON public.event_scores;
CREATE TRIGGER on_event_score_proof
  AFTER INSERT OR UPDATE OF score_id ON public.event_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.on_event_score_proof();

CREATE OR REPLACE FUNCTION public.admin_set_score_proof_level(
  p_score_id UUID,
  p_proof_level public.proof_level,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old public.proof_level;
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  SELECT proof_level INTO v_old FROM public.scores WHERE id = p_score_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'score_not_found';
  END IF;

  PERFORM set_config('tg.proof_bypass', '1', true);

  UPDATE public.scores
  SET
    proof_level = p_proof_level,
    is_validated = CASE
      WHEN p_proof_level = 'honor' THEN false
      ELSE true
    END
  WHERE id = p_score_id;

  PERFORM public.log_score_proof_change(
    p_score_id,
    v_old,
    p_proof_level,
    'admin',
    auth.uid(),
    p_note
  );
END;
$$;

COMMENT ON FUNCTION public.admin_set_score_proof_level IS
  'Admin only: set proof level on a score (audit logged). honor clears is_validated.';

CREATE OR REPLACE FUNCTION public.admin_list_reported_scores(p_limit INT DEFAULT 30)
RETURNS TABLE (
  report_id UUID,
  report_reason TEXT,
  report_created_at TIMESTAMPTZ,
  score_id UUID,
  challenge_id UUID,
  challenge_title TEXT,
  user_id UUID,
  username TEXT,
  value NUMERIC,
  proof_level public.proof_level,
  video_url TEXT,
  submitted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_app_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;

  RETURN QUERY
  SELECT
    r.id AS report_id,
    r.reason AS report_reason,
    r.created_at AS report_created_at,
    s.id AS score_id,
    s.challenge_id,
    c.title AS challenge_title,
    s.user_id,
    p.username,
    s.value,
    s.proof_level,
    s.video_url,
    s.submitted_at
  FROM public.reports r
  INNER JOIN public.scores s ON s.id = r.target_id
  INNER JOIN public.challenges c ON c.id = s.challenge_id
  INNER JOIN public.profiles p ON p.id = s.user_id
  WHERE r.target_type = 'score'
  ORDER BY r.created_at DESC
  LIMIT GREATEST(p_limit, 1);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_score_proof_level(UUID, public.proof_level, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_score_proof_level(UUID, public.proof_level, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_list_reported_scores(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_reported_scores(INT) TO authenticated;

-- Backfill community / event after functions exist
DO $$
DECLARE
  v_row RECORD;
BEGIN
  FOR v_row IN
    SELECT es.score_id
    FROM public.event_scores es
    WHERE es.score_id IS NOT NULL
  LOOP
    PERFORM public.upgrade_score_proof_level(
      v_row.score_id,
      'event_verified',
      'event',
      NULL,
      'Backfill micro-event link'
    );
  END LOOP;

  FOR v_row IN
    SELECT sr.score_id
    FROM public.score_respects sr
    GROUP BY sr.score_id
    HAVING COUNT(*) >= 5
  LOOP
    PERFORM public.maybe_community_verify_score(v_row.score_id);
  END LOOP;
END $$;
