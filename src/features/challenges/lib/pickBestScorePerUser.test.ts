import { describe, expect, it } from 'vitest';

import { pickBestScorePerUser } from '@/features/challenges/lib/pickBestScorePerUser';

describe('pickBestScorePerUser', () => {
  it('keeps fastest time per user', () => {
    const entries = [
      { id: 'a1', user_id: 'u1', value: 120 },
      { id: 'a2', user_id: 'u1', value: 90 },
      { id: 'b1', user_id: 'u2', value: 100 },
    ];
    const best = pickBestScorePerUser(entries, 'time');
    expect(best.map((e) => e.id).sort()).toEqual(['a2', 'b1']);
  });

  it('keeps highest reps per user', () => {
    const entries = [
      { id: 'a1', user_id: 'u1', value: 40 },
      { id: 'a2', user_id: 'u1', value: 55 },
    ];
    expect(pickBestScorePerUser(entries, 'reps')).toEqual([{ id: 'a2', user_id: 'u1', value: 55 }]);
  });

  it('keeps best score per user per variant', () => {
    const entries = [
      { id: 'a1', user_id: 'u1', value: 40, variant: 'standard' },
      { id: 'a2', user_id: 'u1', value: 55, variant: 'standard' },
      { id: 'b1', user_id: 'u1', value: 30, variant: 'bodyweight' },
    ];
    expect(
      pickBestScorePerUser(entries, 'reps')
        .map((e) => e.id)
        .sort(),
    ).toEqual(['a2', 'b1']);
  });
});
