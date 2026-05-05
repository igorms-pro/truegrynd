'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/AuthProvider';
import { fetchOrEnsureProfile } from '@/features/onboarding/services/onboarding';
import { isProfileComplete, type CompleteProfile, type Profile } from '@/lib/types/database.types';

type State =
  | { status: 'loading'; profile: null }
  | { status: 'redirecting'; profile: null }
  | { status: 'ready'; profile: CompleteProfile };

const loadingState: State = { status: 'loading', profile: null };
const redirectingState: State = { status: 'redirecting', profile: null };

/**
 * Gates `/app/*` routes:
 * - not initialized / no user -> redirect to `/auth`
 * - profile incomplete -> redirect to `/onboarding`
 * - otherwise -> resolved profile + status `ready`.
 */
export function useRequireAppAccess(): State {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [state, setState] = useState<State>(loadingState);

  useEffect(() => {
    if (!initialized) return undefined;

    if (!user) {
      router.replace(`/${locale}/auth`);
      return undefined;
    }

    let cancelled = false;
    void (async () => {
      try {
        const profile: Profile = await fetchOrEnsureProfile(user.id);
        if (cancelled) return;

        if (!isProfileComplete(profile)) {
          setState(redirectingState);
          router.replace(`/${locale}/onboarding`);
          return;
        }

        setState({ status: 'ready', profile });
      } catch {
        if (cancelled) return;
        setState(redirectingState);
        router.replace(`/${locale}/auth`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialized, user, router, locale]);

  return state;
}
