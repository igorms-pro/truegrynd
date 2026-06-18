'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  listMyRivalMatches,
  respondRivalMatchInvite,
  type RivalMatchView,
} from '@/features/rivals/services/rivalMatches';
import { useAsyncResource } from '@/hooks/useAsyncResource';

type State =
  | { status: 'loading'; matches: null; error: null }
  | { status: 'error'; matches: null; error: string }
  | { status: 'ready'; matches: RivalMatchView[]; error: null };

export function useMyRivalMatches(userId: string | null): {
  state: State;
  pendingInvites: RivalMatchView[];
  refetch: () => void;
  respond: (matchId: string, accept: boolean) => Promise<void>;
  respondingId: string | null;
} {
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const { state: resource, refetch } = useAsyncResource<RivalMatchView[]>(
    () => listMyRivalMatches(userId as string),
    [userId],
    { enabled: userId !== null },
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready')
      return { status: 'ready', matches: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', matches: null, error: resource.message };
    return { status: 'loading', matches: null, error: null };
  }, [resource]);

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
