'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { HeaderMobileSignIn } from '@/components/HeaderMobileSignIn';
import { useOnboardingProfile } from '@/features/onboarding/hooks/useOnboardingProfile';
import type { OnboardingStep } from '@/features/onboarding/lib/onboardingStep';
import { OnboardingIdentityStep } from '@/features/onboarding/components/OnboardingIdentityStep';
import { OnboardingInitiationStep } from '@/features/onboarding/components/OnboardingInitiationStep';
import { OnboardingFactionStep } from '@/features/onboarding/components/OnboardingFactionStep';

function stepIndex(step: OnboardingStep): 1 | 2 | 3 {
  if (step === 'identity') return 1;
  if (step === 'initiation') return 2;
  return 3;
}

export function OnboardingFlow() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const locale = useLocale();

  const { user, initialized } = useRequireAuth();
  const { profile, step, loading, error, refreshNow } = useOnboardingProfile({
    user,
    initialized,
  });

  const redirectTarget = useMemo(() => `/${locale}/app/overview`, [locale]);
  const userId = user?.id ?? null;
  const [viewStep, setViewStep] = useState<OnboardingStep>(() => {
    if (typeof window === 'undefined') return step;
    if (!userId) return step;
    try {
      const key = `truegrynd:onboarding:viewStep:v1:${userId}`;
      const stored = window.sessionStorage.getItem(key) as OnboardingStep | null;
      return stored === 'identity' || stored === 'initiation' || stored === 'faction'
        ? stored
        : step;
    } catch {
      return step;
    }
  });

  useEffect(() => {
    if (!initialized || loading) return;
    if (step === 'completed') router.replace(redirectTarget);
  }, [initialized, loading, step, router, redirectTarget]);

  useEffect(() => {
    if (!profile) return;
    const key = `truegrynd:onboarding:viewStep:v1:${profile.id}`;
    try {
      window.sessionStorage.setItem(key, viewStep);
    } catch {
      // ignore storage failures
    }
  }, [profile, viewStep]);

  const reload = async () => {
    await refreshNow();
  };

  if (!initialized || loading) {
    return (
      <>
        <HeaderMobileSignIn />
        <main className="min-h-screen bg-background text-foreground px-4 pt-24 pb-10">
          <div className="mx-auto w-full max-w-lg">
            <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <HeaderMobileSignIn />
        <main className="min-h-screen bg-background text-foreground px-4 pt-24 pb-10">
          <div className="mx-auto w-full max-w-lg">
            <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>
            {error ? (
              <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
                <p className="text-sm font-semibold text-primary">{error}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
            )}
          </div>
        </main>
      </>
    );
  }

  const clampToAllowedStep = (next: OnboardingStep): OnboardingStep => {
    const identityMissing =
      profile.username === null ||
      profile.sex === null ||
      profile.age === null ||
      profile.weight_kg === null;

    if (next === 'identity') return 'identity';
    if (next === 'initiation') return identityMissing ? 'identity' : 'initiation';
    if (next === 'faction') {
      if (identityMissing) return 'identity';
      if (!profile.initiation_completed) return 'initiation';
      return 'faction';
    }
    return 'identity';
  };

  const effectiveViewStep = clampToAllowedStep(viewStep);
  const activeStep = stepIndex(effectiveViewStep);

  const handleBack = () => {
    if (effectiveViewStep === 'initiation') setViewStep('identity');
    if (effectiveViewStep === 'faction') setViewStep('initiation');
  };

  let content: ReactNode;
  if (effectiveViewStep === 'identity') {
    content = (
      <OnboardingIdentityStep
        userId={profile.id}
        profile={profile}
        onSaved={async () => {
          await reload();
          setViewStep(profile.initiation_completed ? 'faction' : 'initiation');
        }}
      />
    );
  } else if (effectiveViewStep === 'initiation') {
    content = (
      <OnboardingInitiationStep
        userId={profile.id}
        alreadyCompleted={profile.initiation_completed}
        sex={profile.sex}
        onBack={handleBack}
        onCompleted={async () => {
          await reload();
        }}
        onContinue={() => setViewStep('faction')}
      />
    );
  } else if (effectiveViewStep === 'faction') {
    content = (
      <OnboardingFactionStep
        userId={profile.id}
        initialFaction={profile.faction}
        onBack={handleBack}
        onCompleted={async () => {
          await reload();
        }}
      />
    );
  } else {
    content = null;
  }

  return (
    <>
      <HeaderMobileSignIn />
      <main className="min-h-screen bg-background text-foreground px-4 pt-24 pb-10">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-3xl font-black tracking-tight">{t('title')}</h1>

          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                {t('flowName')}
              </p>
            </div>

            <div className="mt-4">
              <ol className="flex items-center justify-between gap-2 text-center">
                {([1, 2, 3] as const).map((n) => (
                  <li key={n} className="flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        const target: OnboardingStep =
                          n === 1 ? 'identity' : n === 2 ? 'initiation' : 'faction';
                        setViewStep(clampToAllowedStep(target));
                      }}
                      className={`flex h-10 w-full items-center justify-center rounded-md border transition-opacity hover:opacity-90 ${
                        n <= activeStep
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border bg-background'
                      }`}
                      aria-label={
                        n === 1
                          ? t('steps.identity')
                          : n === 2
                            ? t('steps.initiation')
                            : t('steps.faction')
                      }
                    >
                      <span className="text-xs font-black tracking-tight">{n}</span>
                    </button>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {n === 1
                        ? t('steps.identity')
                        : n === 2
                          ? t('steps.initiation')
                          : t('steps.faction')}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
              <p className="text-sm font-semibold text-primary">{error}</p>
            </div>
          ) : null}

          <div className="mt-6">{content}</div>
        </div>
      </main>
    </>
  );
}
