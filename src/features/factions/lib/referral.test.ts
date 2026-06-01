import { describe, expect, it } from 'vitest';

import {
  buildReferralUrl,
  parseReferralDivision,
  parseReferralFaction,
  parseReferralParams,
} from '@/features/factions/lib/referral';

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

describe('parseReferralDivision', () => {
  it('returns valid divisions', () => {
    expect(parseReferralDivision('rookie')).toBe('rookie');
    expect(parseReferralDivision('elite')).toBe('elite');
  });

  it('rejects invalid values', () => {
    expect(parseReferralDivision('legend')).toBeNull();
  });
});

describe('parseReferralParams', () => {
  it('parses full referral context from search params', () => {
    const params = new URLSearchParams(
      'faction=horde&division=rookie&weekly=W22&event=comeback&rival=match-1',
    );
    expect(parseReferralParams(params)).toEqual({
      faction: 'horde',
      division: 'rookie',
      weekly: 'W22',
      event: 'comeback',
      rival: 'match-1',
    });
  });
});

describe('buildReferralUrl', () => {
  it('appends faction param', () => {
    const url = buildReferralUrl('https://truegrynd.app', 'horde');
    expect(url).toBe('https://truegrynd.app/?faction=horde');
  });

  it('preserves existing params and adds context', () => {
    const url = buildReferralUrl('https://truegrynd.app?x=1', {
      faction: 'nomads',
      division: 'regular',
      weekly: 'W22',
    });
    expect(url).toContain('x=1');
    expect(url).toContain('faction=nomads');
    expect(url).toContain('division=regular');
    expect(url).toContain('weekly=W22');
  });
});
