import { describe, expect, it } from 'vitest';

import { formatTopPercent, percentileFromCounts } from '@/features/finisher-card/lib/percentile';

describe('percentileFromCounts', () => {
  it('returns null for invalid totals', () => {
    expect(percentileFromCounts(0, 0)).toBeNull();
    expect(percentileFromCounts(-1, 0)).toBeNull();
  });

  it('computes rank and percentile (best is 1.0)', () => {
    const r1 = percentileFromCounts(100, 0);
    expect(r1).toEqual({ rank: 1, total: 100, percentile: 1 });

    const r11 = percentileFromCounts(100, 10);
    expect(r11).toEqual({ rank: 11, total: 100, percentile: 0.9 });
  });
});

describe('formatTopPercent', () => {
  it('formats percentile into Top X%', () => {
    expect(formatTopPercent(1)).toBe(1);
    expect(formatTopPercent(0.9)).toBe(10);
    expect(formatTopPercent(0.88)).toBe(12);
  });
});
