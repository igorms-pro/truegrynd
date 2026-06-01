import { describe, expect, it } from 'vitest';

import { meetsMinProofLevel, proofLevelRank } from '@/lib/proof/proofLevel';

describe('proofLevelRank', () => {
  it('orders tiers ascending', () => {
    expect(proofLevelRank('honor')).toBeLessThan(proofLevelRank('video_ranked'));
    expect(proofLevelRank('video_ranked')).toBeLessThan(proofLevelRank('community_verified'));
    expect(proofLevelRank('event_verified')).toBeLessThan(proofLevelRank('judge_verified'));
  });
});

describe('meetsMinProofLevel', () => {
  it('excludes honor when no min filter', () => {
    expect(meetsMinProofLevel('honor', null)).toBe(false);
    expect(meetsMinProofLevel('video_ranked', null)).toBe(true);
  });

  it('filters community and judge tiers', () => {
    expect(meetsMinProofLevel('video_ranked', 'community_verified')).toBe(false);
    expect(meetsMinProofLevel('community_verified', 'community_verified')).toBe(true);
    expect(meetsMinProofLevel('event_verified', 'judge_verified')).toBe(false);
    expect(meetsMinProofLevel('judge_verified', 'judge_verified')).toBe(true);
  });
});
