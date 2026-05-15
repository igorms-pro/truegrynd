import { describe, expect, it } from 'vitest';

import {
  isKnownMovementSlug,
  MOVEMENT_CATALOG,
  movementsByCategory,
  OTHER_MOVEMENT_SLUG,
} from '@/features/challenges/lib/movementCatalog';

describe('MOVEMENT_CATALOG', () => {
  it('contains 80+ movements', () => {
    expect(MOVEMENT_CATALOG.length).toBeGreaterThanOrEqual(80);
  });

  it('has no duplicate slugs', () => {
    const slugs = MOVEMENT_CATALOG.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every slug is lowercase with underscores only', () => {
    for (const m of MOVEMENT_CATALOG) {
      expect(m.slug).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });
});

describe('movementsByCategory', () => {
  it('groups all catalog entries', () => {
    const grouped = movementsByCategory();
    let total = 0;
    for (const items of grouped.values()) total += items.length;
    expect(total).toBe(MOVEMENT_CATALOG.length);
  });

  it('has at least 8 categories', () => {
    expect(movementsByCategory().size).toBeGreaterThanOrEqual(8);
  });
});

describe('isKnownMovementSlug', () => {
  it('recognizes catalog slugs', () => {
    expect(isKnownMovementSlug('push_up')).toBe(true);
    expect(isKnownMovementSlug('deadlift')).toBe(true);
    expect(isKnownMovementSlug('burpee')).toBe(true);
  });

  it('rejects unknown slugs', () => {
    expect(isKnownMovementSlug('flying_kick')).toBe(false);
    expect(isKnownMovementSlug('')).toBe(false);
  });
});

describe('OTHER_MOVEMENT_SLUG', () => {
  it('is not a catalog slug', () => {
    expect(isKnownMovementSlug(OTHER_MOVEMENT_SLUG)).toBe(false);
  });
});
