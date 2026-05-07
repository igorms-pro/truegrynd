'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, type ReactNode } from 'react';

import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';
import { useOnboardingProfile } from '@/features/onboarding/hooks/useOnboardingProfile';
import type { OnboardingStep } from '@/features/onboarding/lib/onboardingStep';
import { OnboardingIdentityStep } from '@/features/onboarding/components/OnboardingIdentityStep';
import { OnboardingInitiationStep } from '@/features/onboarding/components/OnboardingInitiationStep';
import { OnboardingFactionStep } from '@/features/onboarding/components/OnboardingFactionStep';
import { useOnboardingViewStep } from '@/features/onboarding/hooks/useOnboardingViewStep';
import { OnboardingShell } from '@/features/onboarding/components/OnboardingShell';
import { OnboardingStepper } from '@/features/onboarding/components/OnboardingStepper';
import { normalizeNextPath } from '@/lib/navigation/nextRedirect';

function stepIndex(step: OnboardingStep): 1 | 2 | 3 {
  if (step === 'identity') return 1;
  if (step === 'initiation') return 2;
  return 3;
}

export function OnboardingFlow() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const { user, initialized } = useRequireAuth();
  const { profile, step, loading, error, refreshNow } = useOnboardingProfile({
    user,
    initialized,
  });

  const redirectTarget = useMemo(() => {
    const safeNext = normalizeNextPath(searchParams.get('next'));
    return safeNext ?? `/${locale}/app/overview`;
  }, [locale, searchParams]);

  useEffect(() => {
    if (!initialized || loading) return;
    if (step === 'completed') router.replace(redirectTarget);
  }, [initialized, loading, step, router, redirectTarget]);

  const reload = useCallback(async () => {
    await refreshNow();
  }, [refreshNow]);

  const { effectiveViewStep, setViewStep, handleBack } = useOnboardingViewStep({
    profile,
    serverStep: step,
  });

  const activeStep = stepIndex(effectiveViewStep);

  const stepLabels = useMemo(
    () => [t('steps.identity'), t('steps.initiation'), t('steps.faction')] as const,
    [t],
  );

  if (!initialized || loading) {
    return (
      <OnboardingShell title={t('title')}>
        <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
      </OnboardingShell>
    );
  }

  if (!profile) {
    return (
      <OnboardingShell title={t('title')}>
        {error ? (
          <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
            <p className="text-sm font-semibold text-primary">{error}</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
        )}
      </OnboardingShell>
    );
  }

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
    <OnboardingShell title={t('title')}>
      <OnboardingStepper
        flowName={t('flowName')}
        activeStep={activeStep}
        labels={stepLabels}
        onSelect={setViewStep}
      />

      {error ? (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">{error}</p>
        </div>
      ) : null}

      <div className="mt-3 md:mt-6">{content}</div>
    </OnboardingShell>
  );
}
