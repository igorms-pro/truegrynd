import { formatScore } from '@/features/challenges/lib/scoreFormat';
import type { ScoreType } from '@/lib/types/database.types';

export type ParticipationRow = {
  value: number;
  is_validated: boolean;
};

export type ChallengeParticipationSummary = {
  attemptCount: number;
  bestValue: number;
  bestIsValidated: boolean;
};

function isBetter(value: number, best: number, scoreType: ScoreType): boolean {
  return scoreType === 'time' ? value < best : value > best;
}

export function summarizeParticipation(
  rows: readonly ParticipationRow[],
  scoreType: ScoreType,
): ChallengeParticipationSummary | null {
  if (rows.length === 0) return null;

  let bestValue = rows[0].value;
  let bestIsValidated = rows[0].is_validated;

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    if (isBetter(row.value, bestValue, scoreType)) {
      bestValue = row.value;
      bestIsValidated = row.is_validated;
      continue;
    }
    if (row.value === bestValue && row.is_validated && !bestIsValidated) {
      bestIsValidated = true;
    }
  }

  return { attemptCount: rows.length, bestValue, bestIsValidated };
}

export function formatParticipationScore(value: number, scoreType: ScoreType): string {
  return formatScore(value, scoreType);
}
