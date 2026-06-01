import { describe, expect, it } from 'vitest';

import { EMPTY_FILTERS } from '@/features/challenges/lib/types';
import { resolveLeaderboardFilters } from '@/features/challenges/lib/resolveLeaderboardFilters';

const variants = ['bodyweight', 'standard', 'savage'] as const;

describe('resolveLeaderboardFilters', () => {
  it('defaults division to viewer profile when untouched', () => {
    expect(
      resolveLeaderboardFilters({
        filters: EMPTY_FILTERS,
        profileDivision: 'regular',
        divisionFilterTouched: false,
        availableVariants: variants,
        variantFilterTouched: false,
      }),
    ).toEqual({
      ...EMPTY_FILTERS,
      division: 'regular',
      variant: 'standard',
    });
  });

  it('keeps global division when viewer explicitly chose global', () => {
    expect(
      resolveLeaderboardFilters({
        filters: EMPTY_FILTERS,
        profileDivision: 'regular',
        divisionFilterTouched: true,
        availableVariants: variants,
        variantFilterTouched: false,
      }),
    ).toEqual({
      ...EMPTY_FILTERS,
      variant: 'standard',
    });
  });

  it('preserves explicit filters when touched', () => {
    const filters = {
      ...EMPTY_FILTERS,
      division: 'elite' as const,
      variant: 'bodyweight' as const,
    };
    expect(
      resolveLeaderboardFilters({
        filters,
        profileDivision: 'regular',
        divisionFilterTouched: true,
        availableVariants: variants,
        variantFilterTouched: true,
      }),
    ).toEqual(filters);
  });
});
