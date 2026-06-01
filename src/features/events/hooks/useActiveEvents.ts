'use client';

import { useEffect, useState } from 'react';

import { getActiveEvents, type ActiveEventSummary } from '@/lib/events/getActiveEvents';

type State =
  | { status: 'loading'; events: ActiveEventSummary[]; error: null }
  | { status: 'ready'; events: ActiveEventSummary[]; error: null }
  | { status: 'error'; events: ActiveEventSummary[]; error: string };

export function useActiveEvents(): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>({ status: 'loading', events: [], error: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const events = await getActiveEvents();
        if (!cancelled) setState({ status: 'ready', events, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', events: [], error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    state,
    refetch: () => {
      setState({ status: 'loading', events: [], error: null });
      setReloadKey((k) => k + 1);
    },
  };
}
