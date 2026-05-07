'use client';

import { useEffect, useState } from 'react';

import { listApprovedChallenges } from '@/features/challenges/services/challenges';
import type { Challenge } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; challenge: null; error: null }
  | { status: 'ready'; challenge: Challenge | null; error: null }
  | { status: 'error'; challenge: null; error: string };

const initial: State = { status: 'loading', challenge: null, error: null };

function pickChallengeOfTheDay(challenges: Challenge[]): Challenge | null {
  if (challenges.length === 0) return null;

  const official = challenges.filter((c) => c.is_official);
  const pool = official.length > 0 ? official : challenges;
  // Deterministic pick (no time-based logic) to satisfy hook purity lint rules.
  return pool[0] ?? null;
}

export function useChallengeOfTheDay(): { state: State; refetch: () => void } {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const challenges = await listApprovedChallenges();
        const challenge = pickChallengeOfTheDay(challenges);
        if (!cancelled) setState({ status: 'ready', challenge, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', challenge: null, error: message });
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
