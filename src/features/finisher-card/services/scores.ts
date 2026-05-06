import { supabase } from '@/lib/supabase';
import type { Score } from '@/lib/types/database.types';

const SCORE_SELECT = 'id,challenge_id,user_id,value,video_url,is_validated,submitted_at';

export async function getScoreById(scoreId: string): Promise<Score | null> {
  const { data, error } = await supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('id', scoreId)
    .maybeSingle<Score>();
  if (error) throw new Error(error.message);
  return data ?? null;
}
