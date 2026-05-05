import { isInBracket } from '@/features/challenges/lib/ageBracket';
import type { LeaderboardEntry, LeaderboardFilters } from '@/features/challenges/lib/types';

export function applyLeaderboardFilters(
  entries: readonly LeaderboardEntry[],
  filters: LeaderboardFilters,
): LeaderboardEntry[] {
  return entries.filter((entry) => {
    const profile = entry.profile;
    if (!profile) return false;
    if (filters.sex && profile.sex !== filters.sex) return false;
    if (filters.faction && profile.faction !== filters.faction) return false;
    if (filters.ageBracket && !isInBracket(profile.age, filters.ageBracket)) return false;
    return true;
  });
}
