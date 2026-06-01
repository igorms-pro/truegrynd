import { describe, expect, it } from 'vitest';

import { pickTopScoresByAxis } from '@/features/profile/lib/passportTopScores';

describe('pickTopScoresByAxis', () => {
  it('keeps best time (lower) and best reps (higher) per axis', () => {
    const top = pickTopScoresByAxis([
      {
        axis: 'engine',
        challengeTitle: 'Run A',
        scoreType: 'time',
        value: 120,
        topPercent: 10,
      },
      {
        axis: 'engine',
        challengeTitle: 'Run B',
        scoreType: 'time',
        value: 90,
        topPercent: 5,
      },
      {
        axis: 'strength',
        challengeTitle: 'Pull',
        scoreType: 'reps',
        value: 40,
        topPercent: null,
      },
      {
        axis: 'strength',
        challengeTitle: 'Pull+',
        scoreType: 'reps',
        value: 55,
        topPercent: 8,
      },
    ]);

    expect(top).toHaveLength(2);
    expect(top.find((s) => s.axis === 'engine')?.value).toBe(90);
    expect(top.find((s) => s.axis === 'strength')?.value).toBe(55);
  });

  it('returns axes in canonical order', () => {
    const top = pickTopScoresByAxis([
      {
        axis: 'grit',
        challengeTitle: 'G',
        scoreType: 'time',
        value: 600,
        topPercent: null,
      },
      {
        axis: 'engine',
        challengeTitle: 'E',
        scoreType: 'time',
        value: 60,
        topPercent: null,
      },
    ]);

    expect(top.map((s) => s.axis)).toEqual(['engine', 'grit']);
  });
});
