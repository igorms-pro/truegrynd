import type { ProfileScoreItem } from '@/features/profile/types';
import { listMyScores as listMyScoresFromLib } from '@/lib/scores';

export type { ProfileScoreItem };

export async function listMyScores(
  userId: string,
  limit = 25,
  options?: { excludeHidden?: boolean },
): Promise<ProfileScoreItem[]> {
  return listMyScoresFromLib(userId, limit, options);
}
