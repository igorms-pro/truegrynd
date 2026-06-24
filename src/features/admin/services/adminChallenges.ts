import { ADMIN_QUEUE_PAGE_SIZE } from '@/features/admin/lib/adminQueueConstants';
import { normalizePostgrestCreator } from '@/features/admin/lib/normalizeCreator';
import { callEdgeFunction } from '@/lib/edgeFunction';
import { supabase } from '@/lib/supabase';
import type { Challenge, ChallengeAiTier, ChallengeVariant } from '@/lib/types/database.types';

const PENDING_CHALLENGE_SELECT =
  'id,title,description,rules,score_type,equipment_tags,is_official,status,creator_id,max_duration_seconds,rejection_reason,reviewed_at,reviewed_by,ai_tier,ai_summary,ai_model,ai_checked_at,ends_at,created_at,creator:profiles!challenges_creator_id_fkey(username),challenge_variants(variant)';

type AdminChallengeRow = Challenge & {
  challenge_variants: { variant: ChallengeVariant }[] | null;
  creator?: unknown;
};

function mapAdminChallengeRow(row: AdminChallengeRow): AdminPendingChallenge {
  const { challenge_variants, creator, ...challenge } = row;
  return {
    ...(challenge as Challenge),
    variants: (challenge_variants ?? []).map((item) => item.variant),
    creator: normalizePostgrestCreator(creator),
  };
}

export type AiTierFilter = 'all' | ChallengeAiTier | 'none';

/** Moderation + arena lifecycle tabs on the MOD queue page. */
export type AdminQueueTabStatus = 'pending' | 'arena_live' | 'arena_done' | 'rejected';

export type AdminPendingChallenge = Challenge & {
  creator: { username: string | null } | null;
};

export type AdminPendingListResult = {
  rows: AdminPendingChallenge[];
  totalCount: number;
};

export type AdminUgcQueueCounts = Record<AdminQueueTabStatus, number>;

const UGC_MOD_QUEUE_TABS: AdminQueueTabStatus[] = [
  'pending',
  'arena_live',
  'arena_done',
  'rejected',
];

function arenaCountsQuery(status: AdminQueueTabStatus, nowIso: string) {
  const base = supabase
    .from('challenges')
    .select('id', { count: 'exact', head: true })
    .eq('is_official', false);

  if (status === 'pending') {
    return base.eq('status', 'pending');
  }
  if (status === 'rejected') {
    return base.eq('status', 'rejected');
  }
  if (status === 'arena_live') {
    return base.eq('status', 'approved').or(`ends_at.is.null,ends_at.gt.${nowIso}`);
  }
  return base.eq('status', 'approved').not('ends_at', 'is', null).lte('ends_at', nowIso);
}

export async function getAdminUgcQueueCounts(): Promise<AdminUgcQueueCounts> {
  const nowIso = new Date().toISOString();
  const pairs = await Promise.all(
    UGC_MOD_QUEUE_TABS.map(async (status) => {
      const { count, error } = await arenaCountsQuery(status, nowIso);
      if (error) throw new Error(error.message);
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(pairs) as AdminUgcQueueCounts;
}

export async function listChallengesForAdmin(options?: {
  page?: number;
  pageSize?: number;
  statusFilter?: AdminQueueTabStatus;
  tierFilter?: AiTierFilter;
  riskFirst?: boolean;
}): Promise<AdminPendingListResult> {
  const pageSize = options?.pageSize ?? ADMIN_QUEUE_PAGE_SIZE;
  const page = Math.max(1, options?.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const statusFilter = options?.statusFilter ?? 'pending';
  const tierFilter = options?.tierFilter ?? 'all';
  const riskFirst = options?.riskFirst ?? true;
  const nowIso = new Date().toISOString();

  let query = supabase
    .from('challenges')
    .select(PENDING_CHALLENGE_SELECT, { count: 'exact' })
    .eq('is_official', false);

  if (statusFilter === 'pending') {
    query = query.eq('status', 'pending');
    if (tierFilter === 'green') query = query.eq('ai_tier', 'green');
    else if (tierFilter === 'orange') query = query.eq('ai_tier', 'orange');
    else if (tierFilter === 'red') query = query.eq('ai_tier', 'red');
    else if (tierFilter === 'none') query = query.is('ai_tier', null);
  } else if (statusFilter === 'rejected') {
    query = query.eq('status', 'rejected');
  } else if (statusFilter === 'arena_live') {
    query = query.eq('status', 'approved').or(`ends_at.is.null,ends_at.gt.${nowIso}`);
  } else {
    query = query.eq('status', 'approved').not('ends_at', 'is', null).lte('ends_at', nowIso);
  }

  if (statusFilter === 'pending' && riskFirst) {
    query = query
      .order('ai_tier_rank', { ascending: true })
      .order('created_at', { ascending: true });
  } else {
    query = query
      .order('reviewed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);
  const rows = (data ?? []).map((row) => mapAdminChallengeRow(row as AdminChallengeRow));
  return { rows, totalCount: count ?? 0 };
}

/** @deprecated Use listChallengesForAdmin */
export async function listPendingChallengesForAdmin(
  options?: Omit<Parameters<typeof listChallengesForAdmin>[0], 'statusFilter'>,
): Promise<AdminPendingListResult> {
  return listChallengesForAdmin({ ...options, statusFilter: 'pending' });
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

export async function adminCloseChallenge(challengeId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_close_challenge', {
    p_challenge_id: challengeId,
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
  await callEdgeFunction('admin-challenge-ai-review', { challenge_id: input.challengeId });
}
