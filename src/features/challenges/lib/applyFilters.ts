import { isInBracket } from '@/features/challenges/lib/ageBracket';
import type { LeaderboardEntry, LeaderboardFilters } from '@/features/challenges/lib/types';
import { meetsMinProofLevel } from '@/lib/proof/proofLevel';
import { normalizeCity } from '@/lib/location';

export function applyLeaderboardFilters(
  entries: readonly LeaderboardEntry[],
  filters: LeaderboardFilters,
): LeaderboardEntry[] {
  return entries.filter((entry) => {
    const profile = entry.profile;
    if (!profile) return false;
    if (!meetsMinProofLevel(entry.proof_level, filters.proofMin)) return false;
    if (filters.sex && profile.sex !== filters.sex) return false;
    if (filters.faction && profile.faction !== filters.faction) return false;
    if (filters.division && profile.division !== filters.division) return false;
    if (filters.variant && entry.variant !== filters.variant) return false;
    if (filters.ageBracket && !isInBracket(profile.age, filters.ageBracket)) return false;
    if (filters.city && normalizeCity(profile.city) !== filters.city) return false;
    if (filters.countryCode && profile.country_code?.toUpperCase() !== filters.countryCode) {
      return false;
    }
    return true;
  });
}
