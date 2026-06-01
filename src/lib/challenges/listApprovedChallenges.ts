import { CHALLENGE_SELECT } from '@/lib/challenges/constants';
import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

/** Approved challenges still open in Arena (excludes admin-closed UGC with past ends_at). */
export async function listApprovedChallenges(): Promise<Challenge[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('challenges')
    .select(CHALLENGE_SELECT)
    .eq('status', 'approved')
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Challenge[];
}
