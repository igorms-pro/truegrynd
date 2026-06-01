import type { ScoreType } from '@/lib/types/database.types';

type Entry = {
  id: string;
  user_id: string;
  value: number;
};

/** Keeps one row per user: best validated attempt for the challenge score type. */
export function pickBestScorePerUser<T extends Entry>(
  entries: readonly T[],
  scoreType: ScoreType,
): T[] {
  const byUser = new Map<string, T>();

  for (const entry of entries) {
    const prev = byUser.get(entry.user_id);
    if (!prev) {
      byUser.set(entry.user_id, entry);
      continue;
    }
    if (scoreType === 'time') {
      if (entry.value < prev.value) byUser.set(entry.user_id, entry);
    } else if (entry.value > prev.value) {
      byUser.set(entry.user_id, entry);
    }
  }

  return [...byUser.values()];
}
