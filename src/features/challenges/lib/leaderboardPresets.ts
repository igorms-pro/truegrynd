import { EMPTY_FILTERS, type LeaderboardFilters } from '@/features/challenges/lib/types';
import { normalizeCity, normalizeCountryCode } from '@/lib/location';
import type { Division, Faction } from '@/lib/types/database.types';

export type LeaderboardPresetId = 'local_top' | 'faction_national' | 'division_global';

export type LeaderboardPresetContext = {
  division: Division | undefined;
  faction: Faction | undefined;
  city: string | null | undefined;
  countryCode: string | null | undefined;
};

export type LeaderboardPreset = {
  id: LeaderboardPresetId;
  filters: LeaderboardFilters;
  disabled: boolean;
};

export function buildLeaderboardPresets(ctx: LeaderboardPresetContext): LeaderboardPreset[] {
  const city = normalizeCity(ctx.city);
  const countryCode = normalizeCountryCode(ctx.countryCode);
  const division = ctx.division ?? null;
  const faction = ctx.faction ?? null;

  return [
    {
      id: 'local_top',
      disabled: !city || !division,
      filters: {
        ...EMPTY_FILTERS,
        division,
        city,
      },
    },
    {
      id: 'faction_national',
      disabled: !countryCode || !faction || !division,
      filters: {
        ...EMPTY_FILTERS,
        faction,
        division,
        countryCode,
      },
    },
    {
      id: 'division_global',
      disabled: !division,
      filters: {
        ...EMPTY_FILTERS,
        division,
      },
    },
  ];
}

export function findMatchingPresetId(
  presets: readonly LeaderboardPreset[],
  filters: LeaderboardFilters,
): LeaderboardPresetId | null {
  const match = presets.find(
    (preset) => !preset.disabled && filtersMatchPreset(filters, preset.filters),
  );
  return match?.id ?? null;
}

function filtersMatchPreset(current: LeaderboardFilters, preset: LeaderboardFilters): boolean {
  return (
    current.sex === preset.sex &&
    current.ageBracket === preset.ageBracket &&
    current.faction === preset.faction &&
    current.division === preset.division &&
    current.variant === preset.variant &&
    current.city === preset.city &&
    current.countryCode === preset.countryCode
  );
}
