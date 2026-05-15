import { supabase } from '@/lib/supabase';

export type RespectCount = {
  scoreId: string;
  count: number;
};

export async function getRespectCounts(scoreIds: string[]): Promise<Map<string, number>> {
  if (scoreIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('score_respects')
    .select('score_id')
    .in('score_id', scoreIds);

  if (error) throw new Error(error.message);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const sid = row.score_id as string;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }
  return counts;
}

export async function getUserRespectedScoreIds(
  userId: string,
  scoreIds: string[],
): Promise<Set<string>> {
  if (scoreIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from('score_respects')
    .select('score_id')
    .eq('user_id', userId)
    .in('score_id', scoreIds);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((r) => r.score_id as string));
}

export async function addRespect(scoreId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('score_respects')
    .insert({ score_id: scoreId, user_id: userId });
  if (error) throw new Error(error.message);
}

export async function removeRespect(scoreId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('score_respects')
    .delete()
    .eq('score_id', scoreId)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
