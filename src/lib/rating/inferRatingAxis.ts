import type { MovementCategory } from '@/features/challenges/lib/movementCatalog';
import type { ScoreType } from '@/lib/types/database.types';

import type { ChallengeRatingAxis } from '@/lib/rating/types';

const STRENGTH_CATEGORIES: readonly MovementCategory[] = [
  'push',
  'pull',
  'squat',
  'hinge',
  'lunge',
  'carry',
];

const POWER_CATEGORIES: readonly MovementCategory[] = ['plyometric', 'olympic'];

type InferInput = {
  scoreType: ScoreType;
  equipmentTags: readonly string[];
  maxDurationSeconds: number | null;
  primaryMovementCategory?: MovementCategory | null;
};

export function inferRatingAxis(input: InferInput): ChallengeRatingAxis {
  const category = input.primaryMovementCategory ?? null;

  if (input.scoreType === 'time') {
    if (input.maxDurationSeconds != null && input.maxDurationSeconds >= 300) return 'grit';
    if (category === 'isometric') return 'grit';
    return 'engine';
  }

  if (category && POWER_CATEGORIES.includes(category)) return 'power';
  if (category === 'cardio') return 'engine';
  if (category === 'isometric' || category === 'core') return 'grit';
  if (category && STRENGTH_CATEGORIES.includes(category)) return 'strength';

  const tags = input.equipmentTags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => ['barbell', 'dumbbell', 'kettlebell'].includes(tag))) return 'strength';
  if (tags.some((tag) => ['box', 'plyo', 'medicine_ball'].includes(tag))) return 'power';

  return 'strength';
}
