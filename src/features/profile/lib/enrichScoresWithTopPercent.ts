import { formatTopPercent, getRankCounts, percentileFromCounts } from '@/lib/rank';
import type { ProfileScoreItem } from '@/features/profile/types';

export async function enrichScoresWithTopPercent(
  scores: ProfileScoreItem[],
): Promise<ProfileScoreItem[]> {
  return Promise.all(
    scores.map(async (score) => {
      if (!score.isValidated) {
        return { ...score, topPercent: null };
      }

      const counts = await getRankCounts({
        challengeId: score.challengeId,
        scoreType: score.scoreType,
        value: score.value,
      });
      const pct = percentileFromCounts(counts.total, counts.better);
      const topPercent = pct ? formatTopPercent(pct.percentile) : null;
      return { ...score, topPercent };
    }),
  );
}
