import { describe, expect, it } from 'vitest';

import { sortScoresByType } from '@/features/challenges/lib/leaderboardSort';

const make = (id: string, value: number) => ({ id, value });

describe('sortScoresByType', () => {
  it('sorts time scores ascending (lower is better)', () => {
    const input = [make('a', 90), make('b', 30), make('c', 60)];
    expect(sortScoresByType(input, 'time').map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });

  it('sorts reps scores descending (higher is better)', () => {
    const input = [make('a', 10), make('b', 30), make('c', 20)];
    expect(sortScoresByType(input, 'reps').map((s) => s.id)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate the input array', () => {
    const input = [make('a', 30), make('b', 10)];
    const snapshot = input.map((s) => s.id);
    sortScoresByType(input, 'reps');
    expect(input.map((s) => s.id)).toEqual(snapshot);
  });
});
