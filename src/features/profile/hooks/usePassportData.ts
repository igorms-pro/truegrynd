'use client';

import { useMemo } from 'react';

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
import { useAsyncResource } from '@/hooks/useAsyncResource';
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

export function usePassportData(
  userId: string | null,
  currentDivision: Division | null,
): { state: State; refetch: () => void } {
  const { state: resource, refetch } = useAsyncResource<PassportData>(
    async () => {
      const [history, topScores, weeklies, rivalWins] = await Promise.all([
        fetchProfileRatingHistory(userId as string),
        fetchPassportTopScores(userId as string),
        listWeeklyCompletions(userId as string),
        listRivalWins(userId as string),
      ]);
      return {
        history,
        topScores,
        weeklies,
        rivalWins,
        divisions: divisionsReached(currentDivision as Division, history),
      };
    },
    [userId, currentDivision],
    { enabled: userId !== null && currentDivision !== null },
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', data: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', data: null, error: resource.message };
    return { status: 'loading', data: null, error: null };
  }, [resource]);

  return { state, refetch };
}
