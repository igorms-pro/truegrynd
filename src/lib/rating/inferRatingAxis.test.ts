import { describe, expect, it } from 'vitest';

import { inferRatingAxis } from '@/lib/rating/inferRatingAxis';

describe('inferRatingAxis', () => {
  it('maps long time caps to grit', () => {
    expect(
      inferRatingAxis({
        scoreType: 'time',
        equipmentTags: [],
        maxDurationSeconds: 600,
      }),
    ).toBe('grit');
  });

  it('maps cardio time to engine', () => {
    expect(
      inferRatingAxis({
        scoreType: 'time',
        equipmentTags: [],
        maxDurationSeconds: 120,
        primaryMovementCategory: 'cardio',
      }),
    ).toBe('engine');
  });

  it('maps plyometric reps to power', () => {
    expect(
      inferRatingAxis({
        scoreType: 'reps',
        equipmentTags: [],
        maxDurationSeconds: null,
        primaryMovementCategory: 'plyometric',
      }),
    ).toBe('power');
  });

  it('maps heavy equipment reps to strength by default', () => {
    expect(
      inferRatingAxis({
        scoreType: 'reps',
        equipmentTags: ['barbell'],
        maxDurationSeconds: null,
      }),
    ).toBe('strength');
  });
});
