'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  listMyRivalMatches,
  respondRivalMatchInvite,
  type RivalMatchView,
} from '@/features/rivals/services/rivalMatches';

type State =
  | { status: 'loading'; matches: null; error: null }
  | { status: 'error'; matches: null; error: string }
  | { status: 'ready'; matches: RivalMatchView[]; error: null };

const initial: State = { status: 'loading', matches: null, error: null };

export function useMyRivalMatches(userId: string | null): {
  state: State;
  pendingInvites: RivalMatchView[];
  refetch: () => void;
  respond: (matchId: string, accept: boolean) => Promise<void>;
  respondingId: string | null;
} {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const matches = await listMyRivalMatches(userId);
        if (!cancelled) setState({ status: 'ready', matches, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', matches: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, userId]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((key) => key + 1);
  }, []);

  const respond = useCallback(
    async (matchId: string, accept: boolean) => {
      setRespondingId(matchId);
      try {
        await respondRivalMatchInvite(matchId, accept);
        refetch();
      } finally {
        setRespondingId(null);
      }
    },
    [refetch],
  );

  const pendingInvites = useMemo(() => {
    if (state.status !== 'ready' || !userId) return [];
    return state.matches.filter(
      (match) =>
        match.status === 'pending' &&
        match.participants.some((p) => p.userId === userId && p.status === 'invited'),
    );
  }, [state, userId]);

  return { state, pendingInvites, refetch, respond, respondingId };
}
