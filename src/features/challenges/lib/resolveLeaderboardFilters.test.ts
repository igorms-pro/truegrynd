import { describe, expect, it } from 'vitest';

import { EMPTY_FILTERS } from '@/features/challenges/lib/types';
import { resolveLeaderboardFilters } from '@/features/challenges/lib/resolveLeaderboardFilters';

describe('resolveLeaderboardFilters', () => {
  it('defaults to the viewer division until the user changes the filter', () => {
    expect(resolveLeaderboardFilters(EMPTY_FILTERS, 'regular', false)).toEqual({
      ...EMPTY_FILTERS,
      division: 'regular',
    });
  });

  it('keeps global when the user explicitly selects it', () => {
    expect(resolveLeaderboardFilters(EMPTY_FILTERS, 'regular', true)).toEqual(EMPTY_FILTERS);
  });

  it('preserves an explicit division selection', () => {
    const filters = { ...EMPTY_FILTERS, division: 'elite' as const };
    expect(resolveLeaderboardFilters(filters, 'regular', true)).toEqual(filters);
  });
});
