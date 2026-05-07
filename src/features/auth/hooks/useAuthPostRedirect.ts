import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isProfileComplete, type Profile } from '@/lib/types/database.types';
import { buildNextUrl, normalizeNextPath } from '@/lib/navigation/nextRedirect';

type PostAuthStep = 'idle' | 'fetchProfile' | 'ensureProfile' | 'redirect' | 'done';

type PostAuthState = {
  redirecting: boolean;
  step: PostAuthStep;
  error: string | null;
};

type Options = {
  user: User | null;
  initialized: boolean;
  locale: string;
  t: (key: string) => string;
};

export function useAuthPostRedirect({ user, initialized, locale, t }: Options): PostAuthState {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const [step, setStep] = useState<PostAuthStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!initialized || !user) return;
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    let cancelled = false;

    const withTimeout = async <T>(p: PromiseLike<T>, ms: number): Promise<T> => {
      const timeout = new Promise<T>((_resolve, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), ms);
      });
      return (await Promise.race([p as unknown as Promise<T>, timeout])) as T;
    };

    const run = async () => {
      setRedirecting(true);
      setError(null);

      try {
        setStep('fetchProfile');
        const profileRes: { data: Profile | null; error: { message: string } | null } =
          await withTimeout(
            supabase
              .from('profiles')
              .select(
                'id,username,sex,age,weight_kg,faction,initiation_completed,avatar_url,created_at,updated_at',
              )
              .eq('id', user.id)
              .maybeSingle<Profile>(),
            6000,
          );

        if (cancelled) return;
        if (profileRes.error) {
          setError(`${t('errors.profileLoadFailed')} (${profileRes.error.message})`);
          return;
        }

        let profile = profileRes.data;

        if (!profile) {
          setStep('ensureProfile');
          const upsertRes: { data: Profile | null; error: { message: string } | null } =
            await withTimeout(
              supabase
                .from('profiles')
                .upsert({ id: user.id }, { onConflict: 'id' })
                .select(
                  'id,username,sex,age,weight_kg,faction,initiation_completed,avatar_url,created_at,updated_at',
                )
                .maybeSingle<Profile>(),
              6000,
            );

          if (cancelled) return;
          if (upsertRes.error) {
            setError(`${t('errors.profileLoadFailed')} (${upsertRes.error.message})`);
            return;
          }

          profile = upsertRes.data;
        }

        setStep('redirect');
        const base = `/${locale}`;
        const safeNext = normalizeNextPath(searchParams.get('next'));
        const target =
          profile && isProfileComplete(profile)
            ? (safeNext ?? `${base}/app/overview`)
            : safeNext
              ? buildNextUrl({ basePath: `${base}/onboarding`, next: safeNext })
              : `${base}/onboarding`;
        router.replace(target);
        setStep('done');
      } catch (e: unknown) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'unknown';
        setError(`${t('errors.profileLoadFailed')} (${message})`);
      } finally {
        setRedirecting(false);
        inFlightRef.current = false;
      }
    };

    void run();

    return () => {
      cancelled = true;
      inFlightRef.current = false;
    };
  }, [initialized, user, locale, router, searchParams, t]);

  return { redirecting, step, error };
}
