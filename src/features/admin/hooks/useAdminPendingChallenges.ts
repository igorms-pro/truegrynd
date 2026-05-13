'use client';

import { useCallback, useEffect, useState } from 'react';

import { ADMIN_QUEUE_PAGE_SIZE, adminQueueMaxPage } from '@/features/admin/lib/adminQueueConstants';
import {
  adminApproveChallenge,
  adminBatchApproveChallenges,
  adminRejectChallenge,
  listPendingChallengesForAdmin,
  type AdminPendingChallenge,
} from '@/features/admin/services/adminChallenges';

type ReadyPayload = {
  rows: AdminPendingChallenge[];
  totalCount: number;
};

type State =
  | { status: 'loading'; rows: AdminPendingChallenge[]; error: null }
  | { status: 'error'; rows: AdminPendingChallenge[]; error: string }
  | ({ status: 'ready'; error: null } & ReadyPayload);

const initial: State = { status: 'loading', rows: [], error: null };

export function useAdminPendingChallenges(): {
  state: State;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  refetch: () => void;
  approveOne: (id: string) => Promise<void>;
  batchApprove: (ids: string[]) => Promise<number>;
  rejectOne: (id: string, reason: string) => Promise<void>;
} {
  const [state, setState] = useState<State>(initial);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { rows, totalCount } = await listPendingChallengesForAdmin({
          page,
          pageSize: ADMIN_QUEUE_PAGE_SIZE,
        });
        if (cancelled) return;
        const maxPage = adminQueueMaxPage(totalCount, ADMIN_QUEUE_PAGE_SIZE);
        if (page > maxPage) {
          setPage(maxPage);
          return;
        }
        setState({ status: 'ready', rows, totalCount, error: null });
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'unknown';
          setState({ status: 'error', rows: [], error: message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const refetch = useCallback(() => {
    setState({ status: 'loading', rows: [], error: null });
    setReloadKey((k) => k + 1);
  }, []);

  const approveOne = useCallback(
    async (id: string) => {
      await adminApproveChallenge(id);
      refetch();
    },
    [refetch],
  );

  const batchApprove = useCallback(
    async (ids: string[]) => {
      const n = await adminBatchApproveChallenges(ids);
      refetch();
      return n;
    },
    [refetch],
  );

  const rejectOne = useCallback(
    async (id: string, reason: string) => {
      await adminRejectChallenge({ challengeId: id, reason });
      refetch();
    },
    [refetch],
  );

  return {
    state,
    page,
    setPage,
    pageSize: ADMIN_QUEUE_PAGE_SIZE,
    refetch,
    approveOne,
    batchApprove,
    rejectOne,
  };
}
