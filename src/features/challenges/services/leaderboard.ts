import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';
import type { LeaderboardEntry } from '@/features/challenges/lib/types';

const LEADERBOARD_SELECT =
  'id,challenge_id,user_id,value,video_url,is_validated,submitted_at,profile:profiles!scores_user_id_fkey(id,username,sex,age,faction)';

type Options = {
  challengeId: string;
  scoreType: ScoreType;
  limit?: number;
};

export async function listLeaderboardScores({
  challengeId,
  scoreType,
  limit = 100,
}: Options): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(LEADERBOARD_SELECT)
    .eq('challenge_id', challengeId)
    .eq('is_validated', true)
    .order('value', { ascending: scoreType === 'time' })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as LeaderboardEntry[];
}
