import type { ChallengeRatingAxis, ScoreType } from '@/lib/types/database.types';

export type PassportScoreRow = {
  challengeTitle: string;
  scoreType: ScoreType;
  value: number;
  axis: ChallengeRatingAxis;
  topPercent: number | null;
};

export type PassportTopScore = PassportScoreRow & {
  axis: ChallengeRatingAxis;
};

function isBetter(scoreType: ScoreType, candidate: number, current: number | null): boolean {
  if (current === null) return true;
  return scoreType === 'time' ? candidate < current : candidate > current;
}

/** Best validated score per challenge rating axis. */
export function pickTopScoresByAxis(rows: readonly PassportScoreRow[]): PassportTopScore[] {
  const best = new Map<ChallengeRatingAxis, PassportTopScore>();

  for (const row of rows) {
    const existing = best.get(row.axis);
    if (!existing || isBetter(row.scoreType, row.value, existing.value)) {
      best.set(row.axis, row);
    }
  }

  return ['engine', 'power', 'strength', 'grit'].flatMap((axis) => {
    const hit = best.get(axis as ChallengeRatingAxis);
    return hit ? [hit] : [];
  });
}
