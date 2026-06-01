import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useOnboardingViewStep } from '@/features/onboarding/hooks/useOnboardingViewStep';
import type { OnboardingStep } from '@/features/onboarding/lib/onboardingStep';
import type { Profile } from '@/lib/types/database.types';

function makeProfile(partial?: Partial<Profile>): Profile {
  return {
    id: 'user-1',
    username: 'igor',
    sex: 'male',
    age: 30,
    weight_kg: 80,
    faction: null,
    division: 'rookie',
    initiation_completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    streak: 0,
    ...partial,
  } as unknown as Profile;
}

function setup(profile: Profile, serverStep: OnboardingStep = 'identity') {
  return renderHook(() => useOnboardingViewStep({ profile, serverStep }));
}

describe('useOnboardingViewStep', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('clamps to identity when identity fields are missing', () => {
    const profile = makeProfile({ username: null });
    const { result } = setup(profile, 'identity');

    act(() => {
      result.current.setViewStep('faction');
    });

    expect(result.current.effectiveViewStep).toBe('identity');
  });

  it('clamps faction to initiation when initiation is not completed', () => {
    const profile = makeProfile({ initiation_completed: false });
    const { result } = setup(profile, 'identity');

    act(() => {
      result.current.setViewStep('faction');
    });

    expect(result.current.effectiveViewStep).toBe('initiation');
  });

  it('allows faction when identity is complete and initiation is completed', () => {
    const profile = makeProfile({ initiation_completed: true });
    const { result } = setup(profile, 'identity');

    act(() => {
      result.current.setViewStep('faction');
    });

    expect(result.current.effectiveViewStep).toBe('faction');
  });

  it('handleBack navigates identity <- initiation <- faction', () => {
    const profile = makeProfile({ initiation_completed: true });
    const { result } = setup(profile, 'identity');

    act(() => {
      result.current.setViewStep('faction');
    });
    expect(result.current.effectiveViewStep).toBe('faction');

    act(() => {
      result.current.handleBack();
    });
    expect(result.current.effectiveViewStep).toBe('initiation');

    act(() => {
      result.current.handleBack();
    });
    expect(result.current.effectiveViewStep).toBe('identity');
  });
});
