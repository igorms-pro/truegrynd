import { describe, expect, it } from 'vitest';

import {
  resolveRivalWinner,
  type RivalChallengeInput,
} from '@/features/rivals/lib/resolveRivalWinner';

describe('resolveRivalWinner', () => {
  const participants = ['user-a', 'user-b'];

  it('picks higher reps on a single reps challenge', () => {
    const challenges: RivalChallengeInput[] = [
      {
        challengeId: 'ch-1',
        scoreType: 'reps',
        scores: [
          { userId: 'user-a', value: 40 },
          { userId: 'user-b', value: 55 },
        ],
      },
    ];

    const result = resolveRivalWinner(challenges, participants);
    expect(result.reason).toBe('decided');
    expect(result.winnerId).toBe('user-b');
  });

  it('picks faster time on a single time challenge', () => {
    const challenges: RivalChallengeInput[] = [
      {
        challengeId: 'ch-1',
        scoreType: 'time',
        scores: [
          { userId: 'user-a', value: 120 },
          { userId: 'user-b', value: 95 },
        ],
      },
    ];

    expect(resolveRivalWinner(challenges, participants).winnerId).toBe('user-b');
  });

  it('returns incomplete when a participant has no score', () => {
    const challenges: RivalChallengeInput[] = [
      {
        challengeId: 'ch-1',
        scoreType: 'reps',
        scores: [{ userId: 'user-a', value: 10 }],
      },
    ];

    expect(resolveRivalWinner(challenges, participants).reason).toBe('incomplete');
  });

  it('uses best-of across multiple challenges', () => {
    const challenges: RivalChallengeInput[] = [
      {
        challengeId: 'ch-1',
        scoreType: 'reps',
        scores: [
          { userId: 'user-a', value: 50 },
          { userId: 'user-b', value: 40 },
        ],
      },
      {
        challengeId: 'ch-2',
        scoreType: 'reps',
        scores: [
          { userId: 'user-a', value: 30 },
          { userId: 'user-b', value: 20 },
        ],
      },
    ];

    expect(resolveRivalWinner(challenges, participants).winnerId).toBe('user-a');
  });

  it('returns tie when challenge wins are split evenly', () => {
    const challenges: RivalChallengeInput[] = [
      {
        challengeId: 'ch-1',
        scoreType: 'reps',
        scores: [
          { userId: 'user-a', value: 50 },
          { userId: 'user-b', value: 40 },
        ],
      },
      {
        challengeId: 'ch-2',
        scoreType: 'reps',
        scores: [
          { userId: 'user-a', value: 20 },
          { userId: 'user-b', value: 30 },
        ],
      },
    ];

    expect(resolveRivalWinner(challenges, participants).reason).toBe('tie');
  });
});
