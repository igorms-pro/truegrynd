import { describe, expect, it } from 'vitest';

import { aggregateEventStandings, eventScorePoints } from '@/lib/events/eventPoints';

describe('eventScorePoints', () => {
  it('caps reps scores at 10000', () => {
    expect(eventScorePoints(50, 'reps')).toBe(50);
    expect(eventScorePoints(99999, 'reps')).toBe(10000);
  });

  it('inverts time scores (faster = more points)', () => {
    expect(eventScorePoints(120, 'time')).toBe(9880);
    expect(eventScorePoints(60, 'time')).toBe(9940);
  });
});

describe('aggregateEventStandings', () => {
  it('sums points across challenges per user', () => {
    const result = aggregateEventStandings([
      { userId: 'a', username: 'alpha', points: 100, challengeId: 'c1' },
      { userId: 'a', username: 'alpha', points: 50, challengeId: 'c2' },
      { userId: 'b', username: 'beta', points: 120, challengeId: 'c1' },
    ]);

    expect(result[0]?.userId).toBe('a');
    expect(result[0]?.totalPoints).toBe(150);
    expect(result[0]?.challengesScored).toBe(2);
    expect(result[1]?.totalPoints).toBe(120);
    expect(result[1]?.challengesScored).toBe(1);
  });
});
