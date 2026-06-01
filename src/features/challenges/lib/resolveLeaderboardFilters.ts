import type { LeaderboardFilters } from '@/features/challenges/lib/types';
import type { Division } from '@/lib/types/database.types';

export function resolveLeaderboardFilters(
  filters: LeaderboardFilters,
  profileDivision: Division | undefined,
  divisionFilterTouched: boolean,
): LeaderboardFilters {
  if (divisionFilterTouched || filters.division !== null || !profileDivision) {
    return filters;
  }
  return { ...filters, division: profileDivision };
}
