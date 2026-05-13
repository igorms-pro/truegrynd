import { ADMIN_QUEUE_PAGE_SIZE } from '@/features/admin/lib/adminQueueConstants';
import { normalizePostgrestCreator } from '@/features/admin/lib/normalizeCreator';
import { supabase } from '@/lib/supabase';
import type { Challenge, ChallengeAiTier } from '@/lib/types/database.types';

const PENDING_CHALLENGE_SELECT =
  'id,title,description,rules,score_type,equipment_tags,is_official,status,creator_id,max_duration_seconds,rejection_reason,reviewed_at,reviewed_by,ai_tier,ai_summary,ai_model,ai_checked_at,created_at,creator:profiles!challenges_creator_id_fkey(username)';

export type AiTierFilter = 'all' | ChallengeAiTier | 'none';

export type AdminPendingChallenge = Challenge & {
  creator: { username: string | null } | null;
};

export type AdminPendingListResult = {
  rows: AdminPendingChallenge[];
  totalCount: number;
};

export async function listPendingChallengesForAdmin(options?: {
  page?: number;
  pageSize?: number;
  tierFilter?: AiTierFilter;
  riskFirst?: boolean;
}): Promise<AdminPendingListResult> {
  const pageSize = options?.pageSize ?? ADMIN_QUEUE_PAGE_SIZE;
  const page = Math.max(1, options?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const tierFilter = options?.tierFilter ?? 'all';
  const riskFirst = options?.riskFirst ?? true;

  let query = supabase
    .from('challenges')
    .select(PENDING_CHALLENGE_SELECT, { count: 'exact' })
    .eq('status', 'pending');

  if (tierFilter === 'green') query = query.eq('ai_tier', 'green');
  else if (tierFilter === 'orange') query = query.eq('ai_tier', 'orange');
  else if (tierFilter === 'red') query = query.eq('ai_tier', 'red');
  else if (tierFilter === 'none') query = query.is('ai_tier', null);

  if (riskFirst) {
    query = query
      .order('ai_tier_rank', { ascending: true })
      .order('created_at', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: true });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);
  const rows = (data ?? []).map((row) => ({
    ...(row as Challenge),
    creator: normalizePostgrestCreator((row as { creator?: unknown }).creator),
  }));
  return { rows, totalCount: count ?? 0 };
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

export async function adminBatchApproveChallenges(
  challengeIds: string[],
  options?: { onlyGreen?: boolean },
): Promise<number> {
  if (challengeIds.length === 0) return 0;
  const { data, error } = await supabase.rpc('admin_batch_approve_challenges', {
    p_ids: challengeIds,
    p_only_green: options?.onlyGreen ?? false,
  });
  if (error) throw new Error(error.message);
  if (data === null || data === undefined) return 0;
  return typeof data === 'number' ? data : Number(data);
}

export async function adminRunChallengeAiReview(input: { challengeId: string }): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('no_session');
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!baseUrl || !anonKey) {
    throw new Error('server_misconfigured');
  }

  const res = await fetch(`${baseUrl}/functions/v1/admin-challenge-ai-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ challenge_id: input.challengeId }),
  });

  const parsed = (await res.json().catch(() => ({}))) as { code?: string };
  if (!res.ok) {
    throw new Error(parsed.code ?? `http_${res.status}`);
  }
}
