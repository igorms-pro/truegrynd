import type { ScoreType } from '@/lib/types/database.types';

export type RivalParticipantScore = {
  userId: string;
  value: number;
};

export type RivalChallengeInput = {
  challengeId: string;
  scoreType: ScoreType;
  scores: readonly RivalParticipantScore[];
};

export type RivalWinnerResult = {
  winnerId: string | null;
  challengeWinners: ReadonlyMap<string, string | null>;
  reason: 'decided' | 'tie' | 'incomplete';
};

function pickChallengeWinner(
  scores: readonly RivalParticipantScore[],
  scoreType: ScoreType,
): string | null {
  if (scores.length === 0) return null;

  let best = scores[0];
  for (let i = 1; i < scores.length; i += 1) {
    const candidate = scores[i];
    if (scoreType === 'time') {
      if (candidate.value < best.value) best = candidate;
    } else if (candidate.value > best.value) {
      best = candidate;
    }
  }

  const tied = scores.filter((s) => s.value === best.value);
  if (tied.length !== 1) return null;
  return best.userId;
}

export function resolveRivalWinner(
  challenges: readonly RivalChallengeInput[],
  participantIds: readonly string[],
): RivalWinnerResult {
  const challengeWinners = new Map<string, string | null>();
  const wins = new Map<string, number>();

  for (const id of participantIds) {
    wins.set(id, 0);
  }

  for (const challenge of challenges) {
    const expected = participantIds.length;
    const submitted = challenge.scores.filter((s) => participantIds.includes(s.userId));
    if (submitted.length < expected) {
      return { winnerId: null, challengeWinners, reason: 'incomplete' };
    }

    const roundWinner = pickChallengeWinner(submitted, challenge.scoreType);
    challengeWinners.set(challenge.challengeId, roundWinner);
    if (roundWinner) {
      wins.set(roundWinner, (wins.get(roundWinner) ?? 0) + 1);
    }
  }

  const maxWins = Math.max(...participantIds.map((id) => wins.get(id) ?? 0));
  const leaders = participantIds.filter((id) => (wins.get(id) ?? 0) === maxWins);

  if (leaders.length !== 1 || maxWins === 0) {
    return { winnerId: null, challengeWinners, reason: 'tie' };
  }

  return { winnerId: leaders[0] ?? null, challengeWinners, reason: 'decided' };
}
