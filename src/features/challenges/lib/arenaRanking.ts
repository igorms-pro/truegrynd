import type { Challenge } from '@/lib/types/database.types';

export type ArenaTab = 'trending' | 'new';

export function rankChallenges(challenges: readonly Challenge[], tab: ArenaTab): Challenge[] {
  if (tab === 'new') return sortNew(challenges);
  return sortTrending(challenges);
}

function sortNew(challenges: readonly Challenge[]): Challenge[] {
  return [...challenges].sort((a, b) => dateKey(b.created_at) - dateKey(a.created_at));
}

function sortTrending(challenges: readonly Challenge[]): Challenge[] {
  return [...challenges].sort((a, b) => {
    const byOfficial = Number(b.is_official) - Number(a.is_official);
    if (byOfficial !== 0) return byOfficial;
    return dateKey(b.created_at) - dateKey(a.created_at);
  });
}

function dateKey(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}
