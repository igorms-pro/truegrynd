'use client';

import { useCallback, useEffect, useState } from 'react';

import { fetchProfileRating } from '@/features/profile/services/profileRating';
import type { ProfileRating } from '@/lib/rating';

type State =
  | { status: 'loading'; rating: null; error: null }
  | { status: 'error'; rating: null; error: string }
  | { status: 'ready'; rating: ProfileRating | null; error: null };

const initial: State = { status: 'loading', rating: null, error: null };

export function useProfileRating(userId: string | null): {
  state: State;
  refetch: () => void;
} {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const rating = await fetchProfileRating(userId);
        if (!cancelled) setState({ status: 'ready', rating, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', rating: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((key) => key + 1);
  }, []);

  return { state, refetch };
}
