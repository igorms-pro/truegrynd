'use client';

import { useEffect, useState } from 'react';

import { getWeeklyChallengeForChallengeId, type ActiveWeeklyChallenge } from '@/lib/weekly';

type State =
  | { status: 'loading'; weekly: null }
  | { status: 'ready'; weekly: ActiveWeeklyChallenge | null };

export function useWeeklyChallengeMatch(challengeId: string): State {
  const [state, setState] = useState<State>({ status: 'loading', weekly: null });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const weekly = await getWeeklyChallengeForChallengeId(challengeId);
        if (!cancelled) setState({ status: 'ready', weekly });
      } catch {
        if (!cancelled) setState({ status: 'ready', weekly: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  return state;
}
