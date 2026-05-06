'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { fetchOrEnsureProfile } from '@/features/onboarding/services/onboarding';
import type { Profile } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; profile: null; error: null }
  | { status: 'error'; profile: null; error: string }
  | { status: 'ready'; profile: Profile; error: null };

const initial: State = { status: 'loading', profile: null, error: null };

export function useProfile(): { state: State; refetch: () => void } {
  const { user, initialized } = useAuth();
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!initialized) return undefined;
    if (!user) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const profile = await fetchOrEnsureProfile(user.id);
        if (!cancelled) setState({ status: 'ready', profile, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', profile: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialized, user, reloadKey]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  return { state, refetch };
}
