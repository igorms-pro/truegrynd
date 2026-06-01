import { describe, expect, it } from 'vitest';

import { summarizeParticipation } from '@/features/challenges/lib/summarizeParticipation';

describe('summarizeParticipation', () => {
  it('returns null when no attempts', () => {
    expect(summarizeParticipation([], 'reps')).toBeNull();
  });

  it('picks highest reps and counts attempts', () => {
    const summary = summarizeParticipation(
      [
        { value: 40, is_validated: false },
        { value: 55, is_validated: true },
      ],
      'reps',
    );
    expect(summary).toEqual({ attemptCount: 2, bestValue: 55, bestIsValidated: true });
  });

  it('picks fastest time', () => {
    const summary = summarizeParticipation(
      [
        { value: 120, is_validated: true },
        { value: 90, is_validated: true },
      ],
      'time',
    );
    expect(summary?.bestValue).toBe(90);
  });
});
