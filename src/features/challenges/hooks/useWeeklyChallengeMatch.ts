'use client';

import { useMemo } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getWeeklyChallengeForChallengeId, type ActiveWeeklyChallenge } from '@/lib/weekly';

type State =
  | { status: 'loading'; weekly: null }
  | { status: 'ready'; weekly: ActiveWeeklyChallenge | null };

export function useWeeklyChallengeMatch(challengeId: string): State {
  const { state: resource } = useAsyncResource<ActiveWeeklyChallenge | null>(
    () => getWeeklyChallengeForChallengeId(challengeId),
    [challengeId],
  );

  return useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', weekly: resource.data };
    // A failed lookup is non-fatal: behave as "no weekly match" (was a swallowed catch).
    if (resource.status === 'error') return { status: 'ready', weekly: null };
    return { status: 'loading', weekly: null };
  }, [resource]);
}
