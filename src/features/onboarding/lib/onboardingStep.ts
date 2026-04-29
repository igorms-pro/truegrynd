import type { CompleteProfile, Profile } from '@/lib/types/database.types';

export type OnboardingStep = 'identity' | 'initiation' | 'faction' | 'completed';

export function getOnboardingStep(profile: Profile | null | undefined): OnboardingStep {
  if (!profile) return 'identity';

  const identityMissing =
    profile.username === null ||
    profile.sex === null ||
    profile.age === null ||
    profile.weight_kg === null;
  if (identityMissing) return 'identity';

  if (!profile.initiation_completed) return 'initiation';

  if (profile.faction === null) return 'faction';

  return 'completed';
}

export function isCompleteProfile(profile: Profile | null | undefined): profile is CompleteProfile {
  return getOnboardingStep(profile) === 'completed';
}
