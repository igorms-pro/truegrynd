import { describe, expect, it } from 'vitest';

import { computeProfileRating } from '@/lib/rating/computeProfileRating';
import type { ValidatedScoreSample } from '@/lib/rating/types';

function sample(
  overrides: Partial<ValidatedScoreSample> &
    Pick<ValidatedScoreSample, 'value' | 'populationValues'>,
): ValidatedScoreSample {
  return {
    challengeId: 'ch-1',
    axis: 'engine',
    scoreType: 'time',
    ...overrides,
  };
}

describe('computeProfileRating', () => {
  it('returns zero global when there are no validated samples', () => {
    const rating = computeProfileRating([], { streakDays: 0, validatedSubmissionsLast30Days: 0 });
    expect(rating.global).toBe(0);
    expect(rating.validatedScoreCount).toBe(0);
    expect(rating.consistency).toBe(0);
  });

  it('computes axis and global from percentile averages', () => {
    const rating = computeProfileRating(
      [
        sample({
          axis: 'engine',
          value: 90,
          populationValues: [120, 100, 90, 80],
        }),
        sample({
          challengeId: 'ch-2',
          axis: 'strength',
          scoreType: 'reps',
          value: 20,
          populationValues: [10, 20, 30, 50],
        }),
      ],
      { streakDays: 7, validatedSubmissionsLast30Days: 3 },
    );

    expect(rating.engine).toBe(75);
    expect(rating.strength).toBe(50);
    expect(rating.validatedScoreCount).toBe(2);
    expect(rating.consistency).toBeGreaterThan(0);
    expect(rating.global).toBeGreaterThan(0);
  });

  it('handles a single-score population at top percentile', () => {
    const rating = computeProfileRating([sample({ value: 60, populationValues: [60] })], {
      streakDays: 1,
      validatedSubmissionsLast30Days: 1,
    });
    expect(rating.engine).toBe(100);
    expect(rating.global).toBeGreaterThan(0);
  });

  it('weights consistency from streak and recent validated activity', () => {
    const low = computeProfileRating([], { streakDays: 0, validatedSubmissionsLast30Days: 0 });
    const high = computeProfileRating([], { streakDays: 21, validatedSubmissionsLast30Days: 6 });
    expect(high.consistency).toBe(100);
    expect(low.consistency).toBe(0);
  });
});
