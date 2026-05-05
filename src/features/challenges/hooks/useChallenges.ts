'use client';

import { useCallback, useEffect, useState } from 'react';

import { listApprovedChallenges } from '@/features/challenges/services/challenges';
import type { Challenge } from '@/lib/types/database.types';

type State = {
  data: Challenge[];
  loading: boolean;
  error: string | null;
};

const initialState: State = { data: [], loading: true, error: null };

export function useChallenges() {
  const [state, setState] = useState<State>(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await listApprovedChallenges();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'unknown';
          setState({ data: [], loading: false, error: message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}
