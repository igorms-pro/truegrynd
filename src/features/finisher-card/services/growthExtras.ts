import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';
import { factionWarContributionPoints } from '@/features/factions/lib/factionWarPoints';

type HistoryRow = {
  rating_global: number;
  recorded_at: string;
};

const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

export async function fetchRatingDeltaNearSubmit(
  userId: string,
  submittedAt: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('profile_rating_history')
    .select('rating_global, recorded_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(2);

  if (error || !data || data.length < 2) return null;

  const [latest, previous] = data as HistoryRow[];
  const submitTime = new Date(submittedAt).getTime();
  const latestTime = new Date(latest.recorded_at).getTime();
  if (Math.abs(latestTime - submitTime) > SUBMIT_WINDOW_MS) return null;

  const delta = Number(latest.rating_global) - Number(previous.rating_global);
  if (Math.abs(delta) < 0.01) return null;
  return Math.round(delta * 10) / 10;
}

export async function fetchActiveEventBadgeForChallenge(
  challengeId: string,
): Promise<string | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('title, event_type, event_challenges!inner(challenge_id)')
    .eq('status', 'active')
    .lte('starts_at', nowIso)
    .gt('ends_at', nowIso)
    .eq('event_challenges.challenge_id', challengeId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return String(data.title).toUpperCase();
}

export function resolveFactionWarPoints(
  isValidated: boolean,
  scoreValue: number,
  scoreType: ScoreType,
  hasActiveWeekly: boolean,
): number | null {
  if (!isValidated || !hasActiveWeekly) return null;
  return factionWarContributionPoints(scoreValue, scoreType);
}
