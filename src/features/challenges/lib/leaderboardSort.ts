import type { ScoreType } from '@/lib/types/database.types';

export function sortScoresByType<T extends { value: number }>(
  scores: readonly T[],
  type: ScoreType,
): T[] {
  const copy = [...scores];
  if (type === 'time') {
    copy.sort((a, b) => a.value - b.value);
  } else {
    copy.sort((a, b) => b.value - a.value);
  }
  return copy;
}
