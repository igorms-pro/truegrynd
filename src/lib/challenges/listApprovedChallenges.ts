import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

/**
 * Approved challenges still open in Arena (excludes admin-closed UGC with past ends_at).
 * Gym-scoped challenges (those backing a gym event) are kept out of the public B2C arena.
 */
export async function listApprovedChallenges(): Promise<Challenge[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .is('gym_id', null)
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}
