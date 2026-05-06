'use client';

import { useCallback, useEffect, useState } from 'react';

import { listMyScores, type ProfileScoreItem } from '@/features/profile/services/scores';

type State =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'ready'; data: ProfileScoreItem[]; error: null };

const initial: State = { status: 'loading', data: null, error: null };

export function useMyScores(userId: string | null): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const data = await listMyScores(userId);
        if (!cancelled) setState({ status: 'ready', data, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', data: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
