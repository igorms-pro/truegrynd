import { describe, expect, it } from 'vitest';

import { computeStreak } from '@/features/profile/lib/streak';

describe('computeStreak', () => {
  it('starts at 1 when no prior activity', () => {
    expect(computeStreak(0, null, '2026-05-15')).toEqual({ streak: 1, changed: true });
  });

  it('is idempotent on same day', () => {
    expect(computeStreak(5, '2026-05-15T10:00:00Z', '2026-05-15')).toEqual({
      streak: 5,
      changed: false,
    });
  });

  it('increments on consecutive day', () => {
    expect(computeStreak(3, '2026-05-14T23:59:00Z', '2026-05-15')).toEqual({
      streak: 4,
      changed: true,
    });
  });

  it('resets after 2-day gap', () => {
    expect(computeStreak(10, '2026-05-12T08:00:00Z', '2026-05-15')).toEqual({
      streak: 1,
      changed: true,
    });
  });

  it('resets after 1-week gap', () => {
    expect(computeStreak(7, '2026-05-01T12:00:00Z', '2026-05-15')).toEqual({
      streak: 1,
      changed: true,
    });
  });

  it('handles streak of 0 + consecutive day', () => {
    expect(computeStreak(0, '2026-05-14T00:00:00Z', '2026-05-15')).toEqual({
      streak: 1,
      changed: true,
    });
  });
});
