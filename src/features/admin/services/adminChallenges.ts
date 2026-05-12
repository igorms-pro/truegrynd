import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

const PENDING_CHALLENGE_SELECT =
  'id,title,description,rules,score_type,equipment_tags,is_official,status,creator_id,max_duration_seconds,rejection_reason,reviewed_at,reviewed_by,created_at,creator:profiles!challenges_creator_id_fkey(username)';

export type AdminPendingChallenge = Challenge & {
  creator: { username: string | null } | null;
};

function normalizeCreator(raw: unknown): { username: string | null } | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const first = raw[0] as { username?: string | null } | undefined;
    return first ? { username: first.username ?? null } : null;
  }
  const o = raw as { username?: string | null };
  return { username: o.username ?? null };
}

export async function listPendingChallengesForAdmin(): Promise<AdminPendingChallenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(PENDING_CHALLENGE_SELECT)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return rows.map((row) => ({
    ...(row as Challenge),
    creator: normalizeCreator((row as { creator?: unknown }).creator),
  }));
}

export async function adminApproveChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_challenge_status', {
    p_challenge_id: challengeId,
    p_status: 'approved',
    p_rejection_reason: null,
  });
  if (error) throw new Error(error.message);
}

export async function adminRejectChallenge(input: {
  challengeId: string;
  reason: string;
}): Promise<void> {
  const { error } = await supabase.rpc('admin_set_challenge_status', {
    p_challenge_id: input.challengeId,
    p_status: 'rejected',
    p_rejection_reason: input.reason.trim(),
  });
  if (error) throw new Error(error.message);
}

export async function adminBatchApproveChallenges(challengeIds: string[]): Promise<number> {
  if (challengeIds.length === 0) return 0;
  const { data, error } = await supabase.rpc('admin_batch_approve_challenges', {
    p_ids: challengeIds,
  });
  if (error) throw new Error(error.message);
  if (data === null || data === undefined) return 0;
  return typeof data === 'number' ? data : Number(data);
}
