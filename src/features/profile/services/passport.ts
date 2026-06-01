import {
  pickTopScoresByAxis,
  type PassportScoreRow,
} from '@/features/profile/lib/passportTopScores';

export { divisionsReached } from '@/features/profile/lib/passportDivisions';
import { formatTopPercent, getRankCounts, percentileFromCounts } from '@/lib/rank';
import type { ChallengeRatingAxis, Division } from '@/lib/types/database.types';
import { supabase } from '@/lib/supabase';

const HISTORY_SELECT = 'id,rating_global,division,recorded_at';
const PASSPORT_SCORE_SELECT =
  'id,challenge_id,value,is_validated,submitted_at,challenge:challenges!scores_challenge_id_fkey(title,score_type,rating_axis)';

export type RatingHistoryEntry = {
  id: string;
  ratingGlobal: number;
  division: Division;
  recordedAt: string;
};

export type WeeklyCompletion = {
  id: string;
  weekLabel: string | null;
  challengeTitle: string;
  completedAt: string;
};

export type RivalWin = {
  matchId: string;
  completedAt: string | null;
  division: Division;
  opponentUsername: string | null;
  challengeTitles: string[];
};

export type PassportTopScore = PassportScoreRow;

type HistoryRow = {
  id: string;
  rating_global: number;
  division: Division;
  recorded_at: string;
};

type ScoreRow = {
  id: string;
  challenge_id: string;
  value: number;
  is_validated: boolean;
  submitted_at: string;
  challenge: {
    title: string;
    score_type: 'time' | 'reps';
    rating_axis: ChallengeRatingAxis;
  } | null;
};

type WeeklyRow = {
  id: string;
  challenge_id: string;
  starts_at: string;
  ends_at: string;
  week_label: string | null;
  challenge: { title: string } | null;
};

export async function fetchProfileRatingHistory(
  userId: string,
  limit = 12,
): Promise<RatingHistoryEntry[]> {
  const { data, error } = await supabase
    .from('profile_rating_history')
    .select(HISTORY_SELECT)
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return ((data ?? []) as HistoryRow[]).map((row) => ({
    id: row.id,
    ratingGlobal: Number(row.rating_global),
    division: row.division,
    recordedAt: row.recorded_at,
  }));
}

export async function fetchPassportTopScores(userId: string): Promise<PassportTopScore[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(PASSPORT_SCORE_SELECT)
    .eq('user_id', userId)
    .eq('is_validated', true)
    .order('submitted_at', { ascending: false })
    .limit(40);

  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as ScoreRow[]).filter((r) => r.challenge);
  const enriched = await Promise.all(
    rows.map(async (r) => {
      const counts = await getRankCounts({
        challengeId: r.challenge_id,
        scoreType: r.challenge!.score_type,
        value: Number(r.value),
      });
      const pct = percentileFromCounts(counts.total, counts.better);
      const topPercent = pct ? formatTopPercent(pct.percentile) : null;
      return {
        challengeTitle: r.challenge!.title,
        scoreType: r.challenge!.score_type,
        value: Number(r.value),
        axis: r.challenge!.rating_axis,
        topPercent,
      } satisfies PassportScoreRow;
    }),
  );

  return pickTopScoresByAxis(enriched);
}

export async function listWeeklyCompletions(
  userId: string,
  limit = 8,
): Promise<WeeklyCompletion[]> {
  const { data: weeklies, error: weeklyError } = await supabase
    .from('weekly_challenges')
    .select('id,challenge_id,starts_at,ends_at,week_label,challenge:challenges(title)')
    .neq('status', 'cancelled')
    .order('ends_at', { ascending: false })
    .limit(24);

  if (weeklyError) throw new Error(weeklyError.message);

  const rows = (weeklies ?? []) as unknown as WeeklyRow[];
  const hits: WeeklyCompletion[] = [];

  for (const row of rows) {
    if (!row.challenge || hits.length >= limit) break;

    const { data: scoreRows, error: scoreError } = await supabase
      .from('scores')
      .select('submitted_at')
      .eq('user_id', userId)
      .eq('challenge_id', row.challenge_id)
      .eq('is_validated', true)
      .gte('submitted_at', row.starts_at)
      .lte('submitted_at', row.ends_at)
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (scoreError) throw new Error(scoreError.message);
    if (!scoreRows?.length) continue;

    hits.push({
      id: row.id,
      weekLabel: row.week_label,
      challengeTitle: row.challenge.title,
      completedAt: scoreRows[0].submitted_at as string,
    });
  }

  return hits;
}

type RivalWinRow = {
  match_id: string;
  completed_at: string | null;
  division: Division;
  opponent_username: string | null;
  challenge_titles: string[] | null;
};

export async function listRivalWins(userId: string, limit = 12): Promise<RivalWin[]> {
  const { data, error } = await supabase.rpc('list_rival_wins_for_passport', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) throw new Error(error.message);

  return ((data ?? []) as RivalWinRow[]).map((row) => ({
    matchId: row.match_id,
    completedAt: row.completed_at,
    division: row.division,
    opponentUsername: row.opponent_username,
    challengeTitles: row.challenge_titles ?? [],
  }));
}
