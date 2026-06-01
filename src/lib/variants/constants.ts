import type { ChallengeVariant } from '@/lib/types/database.types';

export const CHALLENGE_VARIANTS: readonly ChallengeVariant[] = [
  'no_equipment',
  'bodyweight',
  'dumbbell',
  'standard',
  'savage',
] as const;

export const DEFAULT_CHALLENGE_VARIANT: ChallengeVariant = 'standard';

export function isChallengeVariant(value: string): value is ChallengeVariant {
  return (CHALLENGE_VARIANTS as readonly string[]).includes(value);
}

/** Preferred default when a challenge exposes multiple official variants. */
export function pickDefaultChallengeVariant(
  variants: readonly ChallengeVariant[],
): ChallengeVariant {
  if (variants.includes(DEFAULT_CHALLENGE_VARIANT)) return DEFAULT_CHALLENGE_VARIANT;
  return variants[0] ?? DEFAULT_CHALLENGE_VARIANT;
}
