'use client';

import { useEffect, useState } from 'react';

import {
  buildDefaultWeekLabel,
  getActiveWeeklyChallenge,
  type ActiveWeeklyChallenge,
} from '@/lib/weekly';

type State =
  | { status: 'loading'; weekly: null; error: null }
  | { status: 'ready'; weekly: ActiveWeeklyChallenge | null; error: null }
  | { status: 'error'; weekly: null; error: string };

const initial: State = { status: 'loading', weekly: null, error: null };

export function resolveWeeklyDisplayLabel(weekly: ActiveWeeklyChallenge): string {
  return weekly.week_label ?? buildDefaultWeekLabel(new Date(weekly.starts_at));
}

export function useWeeklyChallenge(): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const weekly = await getActiveWeeklyChallenge();
        if (!cancelled) setState({ status: 'ready', weekly, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', weekly: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return {
    state,
    refetch: () => {
      setState(initial);
      setReloadKey((k) => k + 1);
    },
  };
}
