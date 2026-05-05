'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Profile } from '@/lib/types/database.types';
import type { OnboardingStep } from '@/features/onboarding/lib/onboardingStep';

type Options = {
  profile: Profile | null;
  serverStep: OnboardingStep;
};

type Result = {
  effectiveViewStep: Exclude<OnboardingStep, 'completed'>;
  setViewStep: (step: Exclude<OnboardingStep, 'completed'>) => void;
  handleBack: () => void;
  clampToAllowedStep: (
    next: Exclude<OnboardingStep, 'completed'>,
  ) => Exclude<OnboardingStep, 'completed'>;
};

const STEP_STORAGE_VERSION = 'v1';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function isViewStep(step: string | null): step is Exclude<OnboardingStep, 'completed'> {
  return step === 'identity' || step === 'initiation' || step === 'faction';
}

function getStorageKey(userId: string): string {
  return `truegrynd:onboarding:viewStep:${STEP_STORAGE_VERSION}:${userId}`;
}

function getInitialViewStep(
  userId: string | null,
  serverStep: OnboardingStep,
): Exclude<OnboardingStep, 'completed'> {
  if (serverStep === 'completed') return 'identity';
  if (!isClient() || !userId) return serverStep;

  try {
    const stored = window.sessionStorage.getItem(getStorageKey(userId));
    return isViewStep(stored) ? stored : serverStep;
  } catch {
    return serverStep;
  }
}

function clampToAllowedStepFromProfile(
  profile: Profile,
  next: Exclude<OnboardingStep, 'completed'>,
): Exclude<OnboardingStep, 'completed'> {
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
}

export function useOnboardingViewStep({ profile, serverStep }: Options): Result {
  const userId = profile?.id ?? null;

  const [viewStep, setViewStepState] = useState<Exclude<OnboardingStep, 'completed'>>(() =>
    getInitialViewStep(userId, serverStep),
  );

  useEffect(() => {
    if (!profile) return;
    try {
      window.sessionStorage.setItem(getStorageKey(profile.id), viewStep);
    } catch {
      // ignore storage failures
    }
  }, [profile, viewStep]);

  const clampToAllowedStep = useCallback(
    (next: Exclude<OnboardingStep, 'completed'>): Exclude<OnboardingStep, 'completed'> => {
      if (!profile) return 'identity';
      return clampToAllowedStepFromProfile(profile, next);
    },
    [profile],
  );

  const effectiveViewStep = useMemo(() => {
    if (!profile) return 'identity';
    return clampToAllowedStepFromProfile(profile, viewStep);
  }, [profile, viewStep]);

  const setViewStep = useCallback(
    (next: Exclude<OnboardingStep, 'completed'>) => setViewStepState(clampToAllowedStep(next)),
    [clampToAllowedStep],
  );

  const handleBack = useCallback(() => {
    if (effectiveViewStep === 'initiation') setViewStep('identity');
    if (effectiveViewStep === 'faction') setViewStep('initiation');
  }, [effectiveViewStep, setViewStep]);

  return { effectiveViewStep, setViewStep, handleBack, clampToAllowedStep };
}
