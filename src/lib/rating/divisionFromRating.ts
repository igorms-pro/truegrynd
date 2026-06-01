import type { Division } from '@/lib/types/database.types';

import type { ProfileRatingSnapshot } from '@/lib/rating/types';

const DIVISION_ORDER: readonly Division[] = ['rookie', 'regular', 'savage', 'elite'] as const;

export const DIVISION_PROMOTION_RULES = {
  regular: { minGlobal: 35, minValidatedScores: 3 },
  savage: { minGlobal: 60, minValidatedScores: 5 },
  elite: { minGlobal: 82, minValidatedScores: 8, minChallengeAxis: 45 },
} as const;

function divisionIndex(division: Division): number {
  return DIVISION_ORDER.indexOf(division);
}

function meetsRegular(rating: ProfileRatingSnapshot): boolean {
  const rules = DIVISION_PROMOTION_RULES.regular;
  return rating.validatedScoreCount >= rules.minValidatedScores && rating.global >= rules.minGlobal;
}

function meetsSavage(rating: ProfileRatingSnapshot): boolean {
  const rules = DIVISION_PROMOTION_RULES.savage;
  return rating.validatedScoreCount >= rules.minValidatedScores && rating.global >= rules.minGlobal;
}

function meetsElite(rating: ProfileRatingSnapshot): boolean {
  const rules = DIVISION_PROMOTION_RULES.elite;
  const challengeAxes = [rating.engine, rating.power, rating.strength, rating.grit].filter(
    (value) => value > 0,
  );
  const minAxis = challengeAxes.length > 0 ? Math.min(...challengeAxes) : 0;
  return (
    rating.validatedScoreCount >= rules.minValidatedScores &&
    rating.global >= rules.minGlobal &&
    minAxis >= rules.minChallengeAxis
  );
}

function candidateDivision(rating: ProfileRatingSnapshot): Division {
  if (meetsElite(rating)) return 'elite';
  if (meetsSavage(rating)) return 'savage';
  if (meetsRegular(rating)) return 'regular';
  return 'rookie';
}

/** One-way promotion only — never demote in V1. */
export function resolveDivisionPromotion(
  currentDivision: Division,
  rating: ProfileRatingSnapshot,
): Division {
  const candidate = candidateDivision(rating);
  return divisionIndex(candidate) > divisionIndex(currentDivision) ? candidate : currentDivision;
}
