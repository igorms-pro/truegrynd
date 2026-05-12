import { describe, expect, it } from 'vitest';

import { normalizePostgrestCreator } from '@/features/admin/lib/normalizeCreator';

describe('normalizePostgrestCreator', () => {
  it('returns null for null or undefined', () => {
    expect(normalizePostgrestCreator(null)).toBeNull();
    expect(normalizePostgrestCreator(undefined)).toBeNull();
  });

  it('normalizes a single embedded profile object', () => {
    expect(normalizePostgrestCreator({ username: 'alex' })).toEqual({ username: 'alex' });
    expect(normalizePostgrestCreator({ username: null })).toEqual({ username: null });
  });

  it('takes the first element when PostgREST returns an array', () => {
    expect(normalizePostgrestCreator([{ username: 'pat' }])).toEqual({ username: 'pat' });
    expect(normalizePostgrestCreator([])).toBeNull();
  });
});
