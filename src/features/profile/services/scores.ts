import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';

export type ProfileScoreItem = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  scoreType: ScoreType;
  value: number;
  isValidated: boolean;
  submittedAt: string;
};

const SCORE_SELECT =
  'id,challenge_id,value,is_validated,submitted_at,challenge:challenges!scores_challenge_id_fkey(id,title,score_type)';

type Row = {
  id: string;
  challenge_id: string;
  value: number;
  is_validated: boolean;
  submitted_at: string;
  challenge: { id: string; title: string; score_type: ScoreType } | null;
};

export async function listMyScores(userId: string, limit = 25): Promise<ProfileScoreItem[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as Row[];
  return rows
    .filter((r) => !!r.challenge)
    .map((r) => ({
      id: r.id,
      challengeId: r.challenge_id,
      challengeTitle: r.challenge!.title,
      scoreType: r.challenge!.score_type,
      value: Number(r.value),
      isValidated: r.is_validated,
      submittedAt: r.submitted_at,
    }));
}
