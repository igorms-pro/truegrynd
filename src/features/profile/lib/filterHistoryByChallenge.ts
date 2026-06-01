import type { HistoryItem } from '@/features/profile/types';

export function filterHistoryByChallenge(
  items: readonly HistoryItem[],
  challengeId: string | null,
): HistoryItem[] {
  if (!challengeId) return [...items];
  return items.filter((item) => {
    if (item.kind === 'in_progress') return item.challengeId === challengeId;
    return item.challengeId === challengeId;
  });
}
