import { describe, expect, it } from 'vitest';

import { assertTimeScoreWithinCap, TIME_CAP_ERROR } from '@/features/submission/lib/timeScoreCap';

describe('assertTimeScoreWithinCap', () => {
  it('does nothing when not a time challenge', () => {
    expect(() =>
      assertTimeScoreWithinCap({ scoreType: 'reps', value: 9999, maxDurationSeconds: 60 }),
    ).not.toThrow();
  });

  it('does nothing when no cap', () => {
    expect(() =>
      assertTimeScoreWithinCap({ scoreType: 'time', value: 9999, maxDurationSeconds: null }),
    ).not.toThrow();
  });

  it('throws when time exceeds cap', () => {
    expect(() =>
      assertTimeScoreWithinCap({ scoreType: 'time', value: 400, maxDurationSeconds: 300 }),
    ).toThrow(TIME_CAP_ERROR);
  });

  it('allows time equal to cap', () => {
    expect(() =>
      assertTimeScoreWithinCap({ scoreType: 'time', value: 300, maxDurationSeconds: 300 }),
    ).not.toThrow();
  });
});
