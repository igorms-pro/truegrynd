export type CreatorTier = 'none' | 'bronze' | 'silver' | 'gold';

const THRESHOLDS: { tier: CreatorTier; min: number }[] = [
  { tier: 'gold', min: 100 },
  { tier: 'silver', min: 25 },
  { tier: 'bronze', min: 5 },
];

export function creatorTier(score: number): CreatorTier {
  for (const { tier, min } of THRESHOLDS) {
    if (score >= min) return tier;
  }
  return 'none';
}

export function nextTierThreshold(score: number): number | null {
  if (score >= 100) return null;
  if (score >= 25) return 100;
  if (score >= 5) return 25;
  return 5;
}
