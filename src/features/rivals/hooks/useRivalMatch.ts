'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchRivalMatch, type RivalMatchView } from '@/features/rivals/services/rivalMatches';

type State =
  | { status: 'loading'; match: null; error: null }
  | { status: 'error'; match: null; error: string }
  | { status: 'ready'; match: RivalMatchView | null; error: null };

const initial: State = { status: 'loading', match: null, error: null };

export function useRivalMatch(matchId: string | null): {
  state: State;
  refetch: () => void;
} {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!matchId) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const match = await fetchRivalMatch(matchId);
        if (!cancelled) setState({ status: 'ready', match, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', match: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((key) => key + 1);
  }, []);

  return { state, refetch };
}
