'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';

import { fetchOrEnsureProfile } from '@/features/onboarding/services/onboarding';
import type { Profile } from '@/lib/types/database.types';
import { getOnboardingStep } from '@/features/onboarding/lib/onboardingStep';

type Options = {
  user: User | null;
  initialized: boolean;
};

export function useOnboardingProfile({ user, initialized }: Options) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refreshNow = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchOrEnsureProfile(user.id);
      setProfile(next);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initialized || !user) return;
    void refreshNow();
  }, [initialized, user, refreshNow, reloadKey]);

  const step = useMemo(() => getOnboardingStep(profile), [profile]);

  return {
    profile,
    step,
    loading,
    error,
    triggerReload: () => setReloadKey((k) => k + 1),
    refreshNow,
  };
}
