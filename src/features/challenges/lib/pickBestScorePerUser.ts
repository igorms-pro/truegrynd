import type { ScoreType } from '@/lib/types/database.types';

type Entry = {
  id: string;
  user_id: string;
  value: number;
  variant?: string;
};

function dedupeKey(entry: Entry): string {
  return `${entry.user_id}:${entry.variant ?? 'standard'}`;
}

/** Keeps one row per user per variant: best validated attempt for the challenge score type. */
export function pickBestScorePerUser<T extends Entry>(
  entries: readonly T[],
  scoreType: ScoreType,
): T[] {
  const byUserVariant = new Map<string, T>();

  for (const entry of entries) {
    const key = dedupeKey(entry);
    const prev = byUserVariant.get(key);
    if (!prev) {
      byUserVariant.set(key, entry);
      continue;
    }
    if (scoreType === 'time') {
      if (entry.value < prev.value) byUserVariant.set(key, entry);
    } else if (entry.value > prev.value) {
      byUserVariant.set(key, entry);
    }
  }

  return [...byUserVariant.values()];
}
