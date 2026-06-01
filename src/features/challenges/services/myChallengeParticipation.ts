import {
  summarizeParticipation,
  type ChallengeParticipationSummary,
} from '@/features/challenges/lib/summarizeParticipation';
import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';

export type { ChallengeParticipationSummary };

export async function getMyChallengeParticipation(
  userId: string,
  challengeId: string,
  scoreType: ScoreType,
): Promise<ChallengeParticipationSummary | null> {
  const { data, error } = await supabase
    .from('scores')
    .select('value,is_validated')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as { value: number; is_validated: boolean }[];
  return summarizeParticipation(
    rows.map((r) => ({ value: Number(r.value), is_validated: r.is_validated })),
    scoreType,
  );
}
