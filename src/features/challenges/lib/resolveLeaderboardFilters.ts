import type { LeaderboardFilters } from '@/features/challenges/lib/types';
import { pickDefaultChallengeVariant } from '@/lib/variants';
import type { ChallengeVariant, Division } from '@/lib/types/database.types';

type Options = {
  filters: LeaderboardFilters;
  profileDivision: Division | undefined;
  divisionFilterTouched: boolean;
  availableVariants: readonly ChallengeVariant[];
  variantFilterTouched: boolean;
};

export function resolveLeaderboardFilters({
  filters,
  profileDivision,
  divisionFilterTouched,
  availableVariants,
  variantFilterTouched,
}: Options): LeaderboardFilters {
  let next = filters;

  if (!divisionFilterTouched && next.division === null && profileDivision) {
    next = { ...next, division: profileDivision };
  }

  if (!variantFilterTouched && next.variant === null && availableVariants.length > 0) {
    next = { ...next, variant: pickDefaultChallengeVariant(availableVariants) };
  }

  return next;
}
