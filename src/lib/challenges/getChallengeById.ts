import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

/** Uses RLS: approved challenges for everyone; pending/rejected visible only to creator. */
export async function getChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('id', id)
    .maybeSingle<Challenge>();
  if (error) throw new Error(error.message);
  return data ?? null;
}
