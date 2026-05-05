import { describe, expect, it } from 'vitest';

import { ageBracketFromAge, isInBracket } from '@/features/challenges/lib/ageBracket';

describe('ageBracketFromAge', () => {
  it('returns the right bracket for boundary ages', () => {
    expect(ageBracketFromAge(18)).toBe('18-29');
    expect(ageBracketFromAge(29)).toBe('18-29');
    expect(ageBracketFromAge(30)).toBe('30-39');
    expect(ageBracketFromAge(39)).toBe('30-39');
    expect(ageBracketFromAge(40)).toBe('40-49');
    expect(ageBracketFromAge(49)).toBe('40-49');
    expect(ageBracketFromAge(50)).toBe('50+');
    expect(ageBracketFromAge(99)).toBe('50+');
  });

  it('returns null for null or sub-18 ages', () => {
    expect(ageBracketFromAge(null)).toBeNull();
    expect(ageBracketFromAge(17)).toBeNull();
  });
});

describe('isInBracket', () => {
  it('matches when bracket is null (no filter)', () => {
    expect(isInBracket(25, null)).toBe(true);
    expect(isInBracket(null, null)).toBe(true);
  });

  it('matches only when the age is in the bracket', () => {
    expect(isInBracket(25, '18-29')).toBe(true);
    expect(isInBracket(35, '18-29')).toBe(false);
    expect(isInBracket(50, '50+')).toBe(true);
  });
});
