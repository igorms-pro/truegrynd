import { describe, expect, it } from 'vitest';

import { creatorTier, nextTierThreshold } from '@/features/profile/lib/creatorBadge';

describe('creatorTier', () => {
  it('returns none for 0', () => expect(creatorTier(0)).toBe('none'));
  it('returns none for 4', () => expect(creatorTier(4)).toBe('none'));
  it('returns bronze for 5', () => expect(creatorTier(5)).toBe('bronze'));
  it('returns bronze for 24', () => expect(creatorTier(24)).toBe('bronze'));
  it('returns silver for 25', () => expect(creatorTier(25)).toBe('silver'));
  it('returns silver for 99', () => expect(creatorTier(99)).toBe('silver'));
  it('returns gold for 100', () => expect(creatorTier(100)).toBe('gold'));
  it('returns gold for 999', () => expect(creatorTier(999)).toBe('gold'));
});

describe('nextTierThreshold', () => {
  it('returns 5 for 0', () => expect(nextTierThreshold(0)).toBe(5));
  it('returns 25 for 10', () => expect(nextTierThreshold(10)).toBe(25));
  it('returns 100 for 50', () => expect(nextTierThreshold(50)).toBe(100));
  it('returns null for 100+', () => expect(nextTierThreshold(150)).toBeNull());
});
