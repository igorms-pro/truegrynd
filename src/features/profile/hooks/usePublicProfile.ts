'use client';

import { useCallback, useEffect, useState } from 'react';

import { getProfileByUsername } from '@/features/profile/services/profile';
import type { Profile } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; profile: null; error: null }
  | { status: 'ready'; profile: Profile; error: null }
  | { status: 'error'; profile: null; error: string };

const initial: State = { status: 'loading', profile: null, error: null };

const invalidUsernameState: State = {
  status: 'error',
  profile: null,
  error: 'profile_not_found',
};

export function usePublicProfile(username: string): { state: State; refetch: () => void } {
  const trimmed = username.trim();
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!trimmed) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const profile = await getProfileByUsername(trimmed);
        if (!cancelled) setState({ status: 'ready', profile, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', profile: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trimmed, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  const resolvedState = trimmed ? state : invalidUsernameState;

  return { state: resolvedState, refetch };
}
