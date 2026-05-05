'use client';

import { useCallback, useEffect, useState } from 'react';

import { listLeaderboardScores } from '@/features/challenges/services/leaderboard';
import type { ScoreType } from '@/lib/types/database.types';
import type { LeaderboardEntry } from '@/features/challenges/lib/types';

type State = {
  data: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
};

const initialState: State = { data: [], loading: true, error: null };

type Options = {
  challengeId: string | null;
  scoreType: ScoreType | null;
};

export function useChallengeLeaderboard({ challengeId, scoreType }: Options) {
  const [state, setState] = useState<State>(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!challengeId || !scoreType) return undefined;
    let cancelled = false;
    void (async () => {
      try {
        const data = await listLeaderboardScores({ challengeId, scoreType });
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
  }, [challengeId, scoreType, reloadKey]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setReloadKey((k) => k + 1);
  }, []);

  return { ...state, refetch };
}
