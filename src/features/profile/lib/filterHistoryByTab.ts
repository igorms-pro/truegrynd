import type { HistoryItem, HistoryScoreItem, HistoryTab } from '@/features/profile/types';

export const WON_TOP_PERCENT_THRESHOLD = 10;

export function isWonScore(item: HistoryScoreItem): boolean {
  if (!item.isValidated) return false;
  if (item.isOfficial) return true;
  return item.topPercent !== null && item.topPercent <= WON_TOP_PERCENT_THRESHOLD;
}

export function filterHistoryByTab(items: HistoryItem[], tab: HistoryTab): HistoryItem[] {
  switch (tab) {
    case 'all':
      return items;
    case 'in_progress':
      return items.filter((item) => item.kind === 'in_progress');
    case 'validated':
      return items.filter((item) => item.kind === 'score' && item.isValidated);
    case 'saved':
      return items.filter((item) => item.kind === 'score' && !item.isValidated);
    case 'won':
      return items.filter((item) => item.kind === 'score' && isWonScore(item));
    default:
      return items;
  }
}

export function sortHistoryItems(items: HistoryItem[]): HistoryItem[] {
  return [...items].sort((a, b) => {
    const dateA = a.kind === 'score' ? a.submittedAt : a.committedAt;
    const dateB = b.kind === 'score' ? b.submittedAt : b.committedAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

export function buildHistoryItems(
  scores: HistoryScoreItem[],
  inProgress: Extract<HistoryItem, { kind: 'in_progress' }>[],
): HistoryItem[] {
  return sortHistoryItems([...scores, ...inProgress]);
}
