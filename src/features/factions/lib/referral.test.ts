import { describe, expect, it } from 'vitest';

import { buildReferralUrl, parseReferralFaction } from '@/features/factions/lib/referral';

describe('parseReferralFaction', () => {
  it('returns valid factions', () => {
    expect(parseReferralFaction('nomads')).toBe('nomads');
    expect(parseReferralFaction('horde')).toBe('horde');
    expect(parseReferralFaction('iron_alliance')).toBe('iron_alliance');
  });

  it('rejects invalid values', () => {
    expect(parseReferralFaction(null)).toBeNull();
    expect(parseReferralFaction('')).toBeNull();
    expect(parseReferralFaction('avengers')).toBeNull();
  });
});

describe('buildReferralUrl', () => {
  it('appends faction param', () => {
    const url = buildReferralUrl('https://truegrynd.app', 'horde');
    expect(url).toBe('https://truegrynd.app/?faction=horde');
  });

  it('preserves existing params', () => {
    const url = buildReferralUrl('https://truegrynd.app?x=1', 'nomads');
    expect(url).toContain('x=1');
    expect(url).toContain('faction=nomads');
  });
});
