'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  fetchRivalMatch,
  fetchRivalMatchDetailData,
  type RivalMatchDetailData,
  type RivalMatchView,
} from '@/features/rivals/services/rivalMatches';

const POLL_INTERVAL_MS = 30_000;

type State =
  | { status: 'loading'; match: null; detail: null; error: null }
  | { status: 'error'; match: null; detail: null; error: string }
  | {
      status: 'ready';
      match: RivalMatchView | null;
      detail: RivalMatchDetailData | null;
      error: null;
    };

const initial: State = { status: 'loading', match: null, detail: null, error: null };

async function loadMatchDetail(matchId: string): Promise<{
  match: RivalMatchView | null;
  detail: RivalMatchDetailData | null;
}> {
  const match = await fetchRivalMatch(matchId);
  if (!match) return { match: null, detail: null };

  const detail = match.startsAt && match.endsAt ? await fetchRivalMatchDetailData(match) : null;

  return { match, detail };
}

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
        const { match, detail } = await loadMatchDetail(matchId);
        if (!cancelled) {
          setState({ status: 'ready', match, detail, error: null });
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', match: null, detail: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [matchId, reloadKey]);

  const pollingMatchId =
    state.status === 'ready' &&
    state.match &&
    (state.match.status === 'active' || state.match.status === 'pending')
      ? matchId
      : null;

  useEffect(() => {
    if (!pollingMatchId) return undefined;

    const intervalId = window.setInterval(() => {
      void (async () => {
        try {
          const { match, detail } = await loadMatchDetail(pollingMatchId);
          setState({ status: 'ready', match, detail, error: null });
        } catch {
          /* keep last good state on poll failure */
        }
      })();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [pollingMatchId]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((key) => key + 1);
  }, []);

  return { state, refetch };
}
