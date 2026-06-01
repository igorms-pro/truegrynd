import { pickBestScorePerUser } from '@/features/challenges/lib/pickBestScorePerUser';
import type { LeaderboardEntry } from '@/features/challenges/lib/types';
import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';

const LEADERBOARD_SELECT =
  'id,challenge_id,user_id,value,video_url,is_validated,proof_level,variant,submitted_at,profile:profiles!scores_user_id_fkey(id,username,sex,age,faction,division,city,country_code,show_location_on_leaderboard)';

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
  const rows = (data ?? []) as unknown as LeaderboardEntry[];
  return pickBestScorePerUser(rows, scoreType);
}
