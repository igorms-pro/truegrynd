'use client';

import { useCallback, useEffect, useState } from 'react';

import { getChallengeById } from '@/features/challenges/services/challenges';
import type { Challenge } from '@/lib/types/database.types';

type State = {
  data: Challenge | null;
  loading: boolean;
  error: string | null;
};

const initialState: State = { data: null, loading: true, error: null };

export function useChallenge(challengeId: string | null) {
  const [state, setState] = useState<State>(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!challengeId) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const data = await getChallengeById(challengeId);
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (e: unknown) {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'unknown';
          setState({ data: null, loading: false, error: message });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [challengeId, reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}
