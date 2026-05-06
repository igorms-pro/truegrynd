export type PercentileResult = {
  /** 1-based rank where 1 is best. */
  rank: number;
  /** Total ranked population. */
  total: number;
  /** Percentile where 1.0 means "best/top" and 0.0 means "bottom". */
  percentile: number;
};

export function percentileFromCounts(total: number, betterCount: number): PercentileResult | null {
  if (!Number.isFinite(total) || !Number.isFinite(betterCount)) return null;
  if (total <= 0) return null;
  if (betterCount < 0) return null;

  const rank = betterCount + 1;
  const clampedRank = Math.min(Math.max(rank, 1), total);
  const percentile = 1 - (clampedRank - 1) / total;

  return { rank: clampedRank, total, percentile };
}

export function formatTopPercent(percentile: number): number | null {
  if (!Number.isFinite(percentile)) return null;
  const p = Math.min(Math.max(percentile, 0), 1);
  return Math.max(1, Math.ceil((1 - p) * 100));
}
