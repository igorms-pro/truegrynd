import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { supabase } from '@/lib/supabase';
import type { Challenge, ChallengeVariant, WeeklyChallenge } from '@/lib/types/database.types';

type WeeklyRow = WeeklyChallenge & {
  challenge: (Challenge & { challenge_variants: { variant: ChallengeVariant }[] | null }) | null;
};

export type ActiveWeeklyChallenge = WeeklyChallenge & {
  challenge: Challenge;
};

function mapWeeklyRow(row: WeeklyRow): ActiveWeeklyChallenge | null {
  if (!row.challenge) return null;
  const { challenge_variants, ...challengeBase } = row.challenge;
  const variants = (challenge_variants ?? []).map((v) => v.variant);
  return {
    id: row.id,
    challenge_id: row.challenge_id,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    status: row.status,
    week_label: row.week_label,
    created_at: row.created_at,
    updated_at: row.updated_at,
    challenge: { ...challengeBase, variants },
  };
}

/** Current live weekly window (date-based, excludes cancelled/completed). */
export async function getActiveWeeklyChallenge(): Promise<ActiveWeeklyChallenge | null> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('weekly_challenges')
    .select(
      `id,challenge_id,starts_at,ends_at,status,week_label,created_at,updated_at,challenge:challenges(${CHALLENGE_SELECT}, challenge_variants(variant))`,
    )
    .not('status', 'in', '("cancelled","completed")')
    .lte('starts_at', nowIso)
    .gt('ends_at', nowIso)
    .order('starts_at', { ascending: false })
    .limit(1)
    .maybeSingle<WeeklyRow>();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapWeeklyRow(data);
}

export async function getWeeklyChallengeForChallengeId(
  challengeId: string,
): Promise<ActiveWeeklyChallenge | null> {
  const active = await getActiveWeeklyChallenge();
  if (!active || active.challenge_id !== challengeId) return null;
  return active;
}
