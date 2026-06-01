import { percentileFromCounts } from '@/lib/rank/percentile';
import type { ScoreType } from '@/lib/types/database.types';

import type {
  ChallengeRatingAxis,
  ConsistencyInput,
  ProfileRatingSnapshot,
  RatingAxis,
  ValidatedScoreSample,
} from '@/lib/rating/types';
import { CHALLENGE_RATING_AXES, RATING_AXES } from '@/lib/rating/types';

function countBetterValues(
  scoreType: ScoreType,
  value: number,
  populationValues: readonly number[],
): number {
  if (scoreType === 'time') {
    return populationValues.filter((v) => v < value).length;
  }
  return populationValues.filter((v) => v > value).length;
}

function percentileForSample(sample: ValidatedScoreSample): number {
  const total = sample.populationValues.length;
  if (total <= 0) return 0;
  const better = countBetterValues(sample.scoreType, sample.value, sample.populationValues);
  const result = percentileFromCounts(total, better);
  return result?.percentile ?? 0;
}

export function computeConsistencyScore(input: ConsistencyInput): number {
  const streakPart = Math.min(Math.max(input.streakDays, 0) / 21, 1) * 50;
  const activityPart = Math.min(Math.max(input.validatedSubmissionsLast30Days, 0) / 6, 1) * 50;
  return Math.round(streakPart + activityPart);
}

function axisScoreFromSamples(samples: readonly ValidatedScoreSample[]): number {
  if (samples.length === 0) return 0;
  const sum = samples.reduce((acc, sample) => acc + percentileForSample(sample) * 100, 0);
  return Math.round(sum / samples.length);
}

export function computeGlobalRating(axisScores: Record<RatingAxis, number>): number {
  const values = RATING_AXES.map((axis) => axisScores[axis]).filter((value) => value > 0);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
}

export function computeProfileRating(
  samples: readonly ValidatedScoreSample[],
  consistencyInput: ConsistencyInput,
): ProfileRatingSnapshot {
  const byAxis = new Map<ChallengeRatingAxis, ValidatedScoreSample[]>();
  for (const axis of CHALLENGE_RATING_AXES) {
    byAxis.set(axis, []);
  }
  for (const sample of samples) {
    byAxis.get(sample.axis)?.push(sample);
  }

  const axisScores: Record<RatingAxis, number> = {
    engine: axisScoreFromSamples(byAxis.get('engine') ?? []),
    power: axisScoreFromSamples(byAxis.get('power') ?? []),
    strength: axisScoreFromSamples(byAxis.get('strength') ?? []),
    grit: axisScoreFromSamples(byAxis.get('grit') ?? []),
    consistency: computeConsistencyScore(consistencyInput),
  };

  return {
    global: computeGlobalRating(axisScores),
    engine: axisScores.engine,
    power: axisScores.power,
    strength: axisScores.strength,
    grit: axisScores.grit,
    consistency: axisScores.consistency,
    validatedScoreCount: samples.length,
  };
}
