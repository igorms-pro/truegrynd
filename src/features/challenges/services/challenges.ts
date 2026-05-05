import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

const CHALLENGE_SELECT =
  'id,title,description,rules,score_type,equipment_tags,is_official,status,creator_id,created_at';

export async function listApprovedChallenges(): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}

export async function getApprovedChallengeById(id: string): Promise<Challenge | null> {
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .eq('id', id)
    .maybeSingle<Challenge>();
  if (error) throw new Error(error.message);
  return data ?? null;
}
