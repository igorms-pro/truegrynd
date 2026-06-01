'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  divisionsReached,
  fetchPassportTopScores,
  fetchProfileRatingHistory,
  listRivalWins,
  listWeeklyCompletions,
  type PassportTopScore,
  type RatingHistoryEntry,
  type RivalWin,
  type WeeklyCompletion,
} from '@/features/profile/services/passport';
import type { Division } from '@/lib/types/database.types';

type PassportData = {
  history: RatingHistoryEntry[];
  topScores: PassportTopScore[];
  weeklies: WeeklyCompletion[];
  rivalWins: RivalWin[];
  divisions: Division[];
};

type State =
  | { status: 'loading'; data: null; error: null }
  | { status: 'ready'; data: PassportData; error: null }
  | { status: 'error'; data: null; error: string };

const initial: State = { status: 'loading', data: null, error: null };

export function usePassportData(
  userId: string | null,
  currentDivision: Division | null,
): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId || !currentDivision) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const [history, topScores, weeklies, rivalWins] = await Promise.all([
          fetchProfileRatingHistory(userId),
          fetchPassportTopScores(userId),
          listWeeklyCompletions(userId),
          listRivalWins(userId),
        ]);
        if (cancelled) return;
        setState({
          status: 'ready',
          data: {
            history,
            topScores,
            weeklies,
            rivalWins,
            divisions: divisionsReached(currentDivision, history),
          },
          error: null,
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', data: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentDivision, reloadKey, userId]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
