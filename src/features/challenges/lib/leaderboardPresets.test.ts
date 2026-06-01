import { describe, expect, it } from 'vitest';

import {
  buildLeaderboardPresets,
  findMatchingPresetId,
} from '@/features/challenges/lib/leaderboardPresets';
import { EMPTY_FILTERS } from '@/features/challenges/lib/types';

describe('buildLeaderboardPresets', () => {
  const ctx = {
    division: 'rookie' as const,
    faction: 'horde' as const,
    city: 'Paris',
    countryCode: 'fr',
  };

  it('builds local top preset with normalized city', () => {
    const presets = buildLeaderboardPresets(ctx);
    const local = presets.find((p) => p.id === 'local_top');
    expect(local?.disabled).toBe(false);
    expect(local?.filters).toEqual({
      ...EMPTY_FILTERS,
      division: 'rookie',
      city: 'paris',
    });
  });

  it('builds faction national preset with uppercase country', () => {
    const presets = buildLeaderboardPresets(ctx);
    const national = presets.find((p) => p.id === 'faction_national');
    expect(national?.disabled).toBe(false);
    expect(national?.filters).toEqual({
      ...EMPTY_FILTERS,
      faction: 'horde',
      division: 'rookie',
      countryCode: 'FR',
    });
  });

  it('builds division global preset without location filters', () => {
    const presets = buildLeaderboardPresets(ctx);
    const global = presets.find((p) => p.id === 'division_global');
    expect(global?.disabled).toBe(false);
    expect(global?.filters).toEqual({
      ...EMPTY_FILTERS,
      division: 'rookie',
    });
  });

  it('disables local preset when city is missing', () => {
    const presets = buildLeaderboardPresets({ ...ctx, city: null });
    expect(presets.find((p) => p.id === 'local_top')?.disabled).toBe(true);
  });
});

describe('findMatchingPresetId', () => {
  it('returns preset id when filters match', () => {
    const presets = buildLeaderboardPresets({
      division: 'savage',
      faction: 'horde',
      city: 'Paris',
      countryCode: 'FR',
    });
    const savageGlobal = presets.find((p) => p.id === 'division_global');
    expect(findMatchingPresetId(presets, savageGlobal!.filters)).toBe('division_global');
  });

  it('returns null when filters do not match a preset', () => {
    const presets = buildLeaderboardPresets({
      division: 'rookie',
      faction: 'horde',
      city: 'Paris',
      countryCode: 'FR',
    });
    expect(findMatchingPresetId(presets, { ...EMPTY_FILTERS, sex: 'male' })).toBeNull();
  });
});
