-- V2-08: server-side faction war standings per division, scoped to weekly challenge windows.

CREATE TABLE IF NOT EXISTS public.faction_war_contributions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_challenge_id   UUID        NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id               UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  faction               TEXT        NOT NULL CHECK (faction IN ('nomads', 'horde', 'iron_alliance')),
  division              TEXT        NOT NULL CHECK (division IN ('rookie', 'regular', 'savage', 'elite')),
  score_id              UUID        NULL REFERENCES public.scores(id) ON DELETE SET NULL,
  contribution_points   NUMERIC     NOT NULL CHECK (contribution_points >= 0),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT faction_war_contributions_weekly_user_unique UNIQUE (weekly_challenge_id, user_id)
);

COMMENT ON TABLE public.faction_war_contributions IS
  'V2-08: best validated weekly contribution per user. Faction war totals aggregate top-N per faction within division.';

CREATE INDEX IF NOT EXISTS idx_faction_war_contributions_weekly_division
  ON public.faction_war_contributions (weekly_challenge_id, division, faction);

CREATE INDEX IF NOT EXISTS idx_faction_war_contributions_weekly_faction
  ON public.faction_war_contributions (weekly_challenge_id, faction, contribution_points DESC);

ALTER TABLE public.faction_war_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read faction war contributions"
  ON public.faction_war_contributions FOR SELECT
  TO authenticated
  USING (true);

-- Contribution points: reps/higher-is-better uses capped value; time uses inverted cap (faster = more).
CREATE OR REPLACE FUNCTION public.faction_war_contribution_points(
  p_value NUMERIC,
  p_score_type TEXT
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_score_type = 'time' THEN GREATEST(0, 10000 - LEAST(COALESCE(p_value, 0), 9999))
    ELSE LEAST(GREATEST(COALESCE(p_value, 0), 0), 10000)
  END;
$$;

COMMENT ON FUNCTION public.faction_war_contribution_points IS
  'Maps a validated score value to faction war contribution points (aligned with legacy Clan HUD cap).';

CREATE OR REPLACE FUNCTION public.upsert_faction_war_contribution_on_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_weekly_id   UUID;
  v_faction     TEXT;
  v_division    TEXT;
  v_score_type  TEXT;
  v_points      NUMERIC;
BEGIN
  IF NOT NEW.is_validated THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_validated THEN
    RETURN NEW;
  END IF;

  SELECT w.id
  INTO v_weekly_id
  FROM public.weekly_challenges w
  WHERE w.challenge_id = NEW.challenge_id
    AND w.status NOT IN ('cancelled', 'completed')
    AND NEW.submitted_at >= w.starts_at
    AND NEW.submitted_at < w.ends_at
  ORDER BY w.starts_at DESC
  LIMIT 1;

  IF v_weekly_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT p.faction, p.division
  INTO v_faction, v_division
  FROM public.profiles p
  WHERE p.id = NEW.user_id;

  IF v_faction IS NULL OR v_division IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT c.score_type
  INTO v_score_type
  FROM public.challenges c
  WHERE c.id = NEW.challenge_id;

  v_points := public.faction_war_contribution_points(NEW.value, COALESCE(v_score_type, 'reps'));

  INSERT INTO public.faction_war_contributions (
    weekly_challenge_id,
    user_id,
    faction,
    division,
    score_id,
    contribution_points
  )
  VALUES (
    v_weekly_id,
    NEW.user_id,
    v_faction,
    v_division,
    NEW.id,
    v_points
  )
  ON CONFLICT (weekly_challenge_id, user_id) DO UPDATE
  SET
    contribution_points = GREATEST(
      public.faction_war_contributions.contribution_points,
      EXCLUDED.contribution_points
    ),
    score_id = CASE
      WHEN EXCLUDED.contribution_points > public.faction_war_contributions.contribution_points
        THEN EXCLUDED.score_id
      ELSE public.faction_war_contributions.score_id
    END,
    faction = EXCLUDED.faction,
    division = EXCLUDED.division,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_score_faction_war_contribution ON public.scores;
CREATE TRIGGER on_score_faction_war_contribution
  AFTER INSERT OR UPDATE ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_faction_war_contribution_on_score();

-- Standings: sum of top 10 contributions per faction + 5 pts per active fighter in division.
CREATE OR REPLACE FUNCTION public.get_faction_war_standings(
  p_weekly_challenge_id UUID,
  p_division TEXT,
  p_top_n INT DEFAULT 10,
  p_participation_bonus NUMERIC DEFAULT 5
)
RETURNS TABLE (
  faction TEXT,
  points NUMERIC,
  members INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH factions AS (
    SELECT unnest(ARRAY['nomads', 'horde', 'iron_alliance']::TEXT[]) AS faction
  ),
  ranked AS (
    SELECT
      c.faction,
      c.contribution_points,
      ROW_NUMBER() OVER (
        PARTITION BY c.faction
        ORDER BY c.contribution_points DESC, c.updated_at ASC
      ) AS rn
    FROM public.faction_war_contributions c
    WHERE c.weekly_challenge_id = p_weekly_challenge_id
      AND c.division = p_division
  ),
  top_agg AS (
    SELECT faction, COALESCE(SUM(contribution_points), 0) AS top_points
    FROM ranked
    WHERE rn <= GREATEST(p_top_n, 1)
    GROUP BY faction
  ),
  fighter_agg AS (
    SELECT faction, COUNT(DISTINCT user_id)::INT AS members
    FROM public.faction_war_contributions
    WHERE weekly_challenge_id = p_weekly_challenge_id
      AND division = p_division
    GROUP BY faction
  )
  SELECT
    f.faction,
    COALESCE(t.top_points, 0) + COALESCE(g.members, 0) * p_participation_bonus AS points,
    COALESCE(g.members, 0) AS members
  FROM factions f
  LEFT JOIN top_agg t ON t.faction = f.faction
  LEFT JOIN fighter_agg g ON g.faction = f.faction
  ORDER BY points DESC, f.faction ASC;
$$;

COMMENT ON FUNCTION public.get_faction_war_standings IS
  'V2-08: faction war leaderboard for a weekly window and division (top-N sum + participation bonus).';

CREATE OR REPLACE FUNCTION public.get_faction_war_top_contributors(
  p_weekly_challenge_id UUID,
  p_faction TEXT,
  p_division TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  points NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.user_id,
    p.username,
    c.contribution_points AS points
  FROM public.faction_war_contributions c
  JOIN public.profiles p ON p.id = c.user_id
  WHERE c.weekly_challenge_id = p_weekly_challenge_id
    AND c.faction = p_faction
    AND c.division = p_division
  ORDER BY c.contribution_points DESC, c.updated_at ASC
  LIMIT GREATEST(p_limit, 1);
$$;

CREATE OR REPLACE FUNCTION public.get_faction_war_user_contribution(
  p_weekly_challenge_id UUID,
  p_user_id UUID
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT contribution_points
      FROM public.faction_war_contributions
      WHERE weekly_challenge_id = p_weekly_challenge_id
        AND user_id = p_user_id
    ),
    0
  );
$$;

REVOKE ALL ON FUNCTION public.get_faction_war_standings(UUID, TEXT, INT, NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_faction_war_standings(UUID, TEXT, INT, NUMERIC) TO authenticated;

REVOKE ALL ON FUNCTION public.get_faction_war_top_contributors(UUID, TEXT, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_faction_war_top_contributors(UUID, TEXT, TEXT, INT) TO authenticated;

REVOKE ALL ON FUNCTION public.get_faction_war_user_contribution(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_faction_war_user_contribution(UUID, UUID) TO authenticated;
