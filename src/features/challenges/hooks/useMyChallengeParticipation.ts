'use client';

import { useEffect, useState } from 'react';

import {
  getMyChallengeParticipation,
  type ChallengeParticipationSummary,
} from '@/features/challenges/services/myChallengeParticipation';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import type { ScoreType } from '@/lib/types/database.types';

type State =
  | { status: 'loading' }
  | { status: 'ready'; data: ChallengeParticipationSummary | null }
  | { status: 'error' };

function buildRequestKey(userId: string, challengeId: string, scoreType: ScoreType): string {
  return `${userId}:${challengeId}:${scoreType}`;
}

export function useMyChallengeParticipation(
  challengeId: string,
  scoreType: ScoreType,
): { state: State } {
  const profile = useOptionalAppProfile();
  const userId = profile?.id ?? null;
  const [state, setState] = useState<State>({ status: 'loading' });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = userId ? buildRequestKey(userId, challengeId, scoreType) : null;
  const isPending = requestKey !== null && loadedKey !== requestKey;
  const displayState: State = isPending ? { status: 'loading' } : state;

  useEffect(() => {
    if (!userId || !requestKey) return undefined;

    let cancelled = false;

    void (async () => {
      try {
        const data = await getMyChallengeParticipation(userId, challengeId, scoreType);
        if (!cancelled) {
          setState({ status: 'ready', data });
          setLoadedKey(requestKey);
        }
      } catch {
        if (!cancelled) {
          setState({ status: 'error' });
          setLoadedKey(requestKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [challengeId, requestKey, scoreType, userId]);

  if (!userId) {
    return { state: { status: 'ready', data: null } };
  }

  return { state: displayState };
}
