import type { UserScoreItem } from '@/lib/scores/types';
import { supabase } from '@/lib/supabase';
import type { ScoreType, ProofLevel } from '@/lib/types/database.types';

const SCORE_SELECT =
  'id,challenge_id,value,video_url,is_validated,proof_level,is_hidden,submitted_at,challenge:challenges!scores_challenge_id_fkey(id,title,score_type,is_official)';

type ListOptions = {
  excludeHidden?: boolean;
};

type Row = {
  id: string;
  challenge_id: string;
  value: number;
  video_url: string | null;
  is_validated: boolean;
  proof_level: ProofLevel;
  is_hidden: boolean;
  submitted_at: string;
  challenge: { id: string; title: string; score_type: ScoreType; is_official: boolean } | null;
};

export async function listMyScores(
  userId: string,
  limit = 25,
  options?: ListOptions,
): Promise<UserScoreItem[]> {
  let query = supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (options?.excludeHidden) {
    query = query.eq('is_hidden', false);
  }

  const { data, error } = await query;

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
      videoUrl: r.video_url,
      isValidated: r.is_validated,
      proofLevel: r.proof_level,
      isHidden: r.is_hidden,
      isOfficial: r.challenge!.is_official,
      topPercent: null,
      submittedAt: r.submitted_at,
    }));
}
