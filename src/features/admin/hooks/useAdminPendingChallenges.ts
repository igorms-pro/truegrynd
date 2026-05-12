'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  adminApproveChallenge,
  adminBatchApproveChallenges,
  adminRejectChallenge,
  listPendingChallengesForAdmin,
  type AdminPendingChallenge,
} from '@/features/admin/services/adminChallenges';

type State =
  | { status: 'loading'; rows: AdminPendingChallenge[]; error: null }
  | { status: 'error'; rows: AdminPendingChallenge[]; error: string }
  | { status: 'ready'; rows: AdminPendingChallenge[]; error: null };

const initial: State = { status: 'loading', rows: [], error: null };

export function useAdminPendingChallenges(): {
  state: State;
  refetch: () => void;
  approveOne: (id: string) => Promise<void>;
  batchApprove: (ids: string[]) => Promise<number>;
  rejectOne: (id: string, reason: string) => Promise<void>;
} {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listPendingChallengesForAdmin();
        if (!cancelled) setState({ status: 'ready', rows, error: null });
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
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
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

  return { state, refetch, approveOne, batchApprove, rejectOne };
}
