import { supabase } from '@/lib/supabase';
import type { ScoreType } from '@/lib/types/database.types';

type Options = {
  challengeId: string;
  scoreType: ScoreType;
  value: number;
};

export type RankCounts = {
  total: number;
  better: number;
};

export async function getRankCounts({
  challengeId,
  scoreType,
  value,
}: Options): Promise<RankCounts> {
  const totalRes = await supabase
    .from('scores')
    .select('id', { head: true, count: 'exact' })
    .eq('challenge_id', challengeId)
    .eq('is_validated', true);
  if (totalRes.error) throw new Error(totalRes.error.message);

  const total = totalRes.count ?? 0;

  const betterQuery = supabase
    .from('scores')
    .select('id', { head: true, count: 'exact' })
    .eq('challenge_id', challengeId)
    .eq('is_validated', true);

  const betterRes =
    scoreType === 'time'
      ? await betterQuery.lt('value', value)
      : await betterQuery.gt('value', value);
  if (betterRes.error) throw new Error(betterRes.error.message);

  const better = betterRes.count ?? 0;
  return { total, better };
}
