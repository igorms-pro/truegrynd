import { describe, expect, it } from 'vitest';

import {
  buildDefaultWeekLabel,
  getWeeklyTimeRemaining,
  isWeeklyWindowLive,
} from '@/lib/weekly/formatWeeklyWindow';

describe('buildDefaultWeekLabel', () => {
  it('returns ISO week label for a known Monday', () => {
    const label = buildDefaultWeekLabel(new Date('2026-06-01T12:00:00Z'));
    expect(label).toMatch(/^W\d{2} · \d{4}$/);
  });
});

describe('getWeeklyTimeRemaining', () => {
  it('returns null when window already ended', () => {
    const endsAt = new Date('2026-01-01T00:00:00Z');
    const now = new Date('2026-06-01T00:00:00Z');
    expect(getWeeklyTimeRemaining(endsAt, now)).toBeNull();
  });

  it('returns days and hours when time remains', () => {
    const now = new Date('2026-06-01T00:00:00Z');
    const endsAt = new Date('2026-06-03T05:00:00Z');
    expect(getWeeklyTimeRemaining(endsAt, now)).toEqual({
      days: 2,
      hours: 5,
      minutes: 0,
    });
  });
});

describe('isWeeklyWindowLive', () => {
  it('is true inside the window', () => {
    const startsAt = new Date('2026-06-01T00:00:00Z');
    const endsAt = new Date('2026-06-08T00:00:00Z');
    const now = new Date('2026-06-03T00:00:00Z');
    expect(isWeeklyWindowLive(startsAt, endsAt, now)).toBe(true);
  });

  it('is false before start', () => {
    const startsAt = new Date('2026-06-08T00:00:00Z');
    const endsAt = new Date('2026-06-15T00:00:00Z');
    const now = new Date('2026-06-01T00:00:00Z');
    expect(isWeeklyWindowLive(startsAt, endsAt, now)).toBe(false);
  });
});
