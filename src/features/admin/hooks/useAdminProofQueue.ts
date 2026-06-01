'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  adminSetScoreProofLevel,
  listAdminReportedScores,
  type AdminReportedScore,
} from '@/features/admin/services/adminProof';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; rows: AdminReportedScore[] };

export function useAdminProofQueue(): {
  state: State;
  busyScoreId: string | null;
  refetch: () => void;
  setProofLevel: (
    scoreId: string,
    level: AdminReportedScore['proofLevel'],
    note?: string,
  ) => Promise<void>;
} {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [busyScoreId, setBusyScoreId] = useState<string | null>(null);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setState({ status: 'loading' });
      try {
        const rows = await listAdminReportedScores();
        if (!cancelled) setState({ status: 'ready', rows });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const setProofLevel = useCallback(
    async (scoreId: string, level: AdminReportedScore['proofLevel'], note?: string) => {
      setBusyScoreId(scoreId);
      try {
        await adminSetScoreProofLevel(scoreId, level, note);
        refetch();
      } finally {
        setBusyScoreId(null);
      }
    },
    [refetch],
  );

  return { state, busyScoreId, refetch, setProofLevel };
}
