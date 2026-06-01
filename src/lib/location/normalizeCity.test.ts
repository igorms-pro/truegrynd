import { describe, expect, it } from 'vitest';

import { normalizeCity, sanitizeCityInput } from '@/lib/location/normalizeCity';

describe('normalizeCity', () => {
  it('lowercases and trims for matching', () => {
    expect(normalizeCity('  Paris  ')).toBe('paris');
    expect(normalizeCity('New   York')).toBe('new york');
  });

  it('returns null for empty or too-short values', () => {
    expect(normalizeCity(null)).toBeNull();
    expect(normalizeCity('')).toBeNull();
    expect(normalizeCity(' P ')).toBeNull();
  });
});

describe('sanitizeCityInput', () => {
  it('preserves display casing while collapsing whitespace', () => {
    expect(sanitizeCityInput('  Paris  ')).toBe('Paris');
    expect(sanitizeCityInput('New   York')).toBe('New York');
  });

  it('returns null for invalid input', () => {
    expect(sanitizeCityInput('')).toBeNull();
  });
});
