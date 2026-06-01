import { describe, expect, it } from 'vitest';

import { factionPath, parseFactionSlug } from '@/features/factions/lib/factionSlug';

describe('parseFactionSlug', () => {
  it('accepts valid faction slugs', () => {
    expect(parseFactionSlug('nomads')).toBe('nomads');
    expect(parseFactionSlug('horde')).toBe('horde');
    expect(parseFactionSlug('iron_alliance')).toBe('iron_alliance');
  });

  it('rejects invalid slugs', () => {
    expect(parseFactionSlug('invalid')).toBeNull();
    expect(parseFactionSlug('')).toBeNull();
  });
});

describe('factionPath', () => {
  it('builds locale-prefixed faction route', () => {
    expect(factionPath('en', 'horde')).toBe('/en/app/faction/horde');
  });
});
