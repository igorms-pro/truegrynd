import type { ChallengeRatingAxis, ScoreType } from '@/lib/types/database.types';

export type { ChallengeRatingAxis };

export type RatingAxis = ChallengeRatingAxis | 'consistency';

export const CHALLENGE_RATING_AXES: readonly ChallengeRatingAxis[] = [
  'engine',
  'power',
  'strength',
  'grit',
] as const;

export const RATING_AXES: readonly RatingAxis[] = [
  'engine',
  'power',
  'strength',
  'grit',
  'consistency',
] as const;

export type ValidatedScoreSample = {
  challengeId: string;
  axis: ChallengeRatingAxis;
  scoreType: ScoreType;
  value: number;
  /** All validated values on this challenge (population for percentile). */
  populationValues: readonly number[];
};

export type ConsistencyInput = {
  streakDays: number;
  validatedSubmissionsLast30Days: number;
};

export type ProfileRatingSnapshot = {
  global: number;
  engine: number;
  power: number;
  strength: number;
  grit: number;
  consistency: number;
  validatedScoreCount: number;
};

export type ProfileRating = ProfileRatingSnapshot & {
  userId: string;
  computedAt: string;
};
