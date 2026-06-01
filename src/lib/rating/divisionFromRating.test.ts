import { describe, expect, it } from 'vitest';

import { resolveDivisionPromotion } from '@/lib/rating/divisionFromRating';
import type { ProfileRatingSnapshot } from '@/lib/rating/types';

function rating(overrides: Partial<ProfileRatingSnapshot>): ProfileRatingSnapshot {
  return {
    global: 0,
    engine: 0,
    power: 0,
    strength: 0,
    grit: 0,
    consistency: 0,
    validatedScoreCount: 0,
    ...overrides,
  };
}

describe('resolveDivisionPromotion', () => {
  it('keeps rookie when thresholds are not met', () => {
    expect(resolveDivisionPromotion('rookie', rating({ global: 20, validatedScoreCount: 1 }))).toBe(
      'rookie',
    );
  });

  it('promotes to regular with enough scores and global rating', () => {
    expect(resolveDivisionPromotion('rookie', rating({ global: 40, validatedScoreCount: 3 }))).toBe(
      'regular',
    );
  });

  it('promotes to savage then elite when criteria are met', () => {
    expect(
      resolveDivisionPromotion('regular', rating({ global: 65, validatedScoreCount: 6 })),
    ).toBe('savage');
    expect(
      resolveDivisionPromotion(
        'savage',
        rating({
          global: 85,
          validatedScoreCount: 10,
          engine: 70,
          strength: 60,
          power: 55,
          grit: 50,
        }),
      ),
    ).toBe('elite');
  });

  it('never demotes when rating drops', () => {
    expect(resolveDivisionPromotion('elite', rating({ global: 10, validatedScoreCount: 1 }))).toBe(
      'elite',
    );
  });
});
