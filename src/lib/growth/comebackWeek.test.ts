import { describe, expect, it } from 'vitest';

import { getComebackEligibility } from '@/lib/growth/comebackWeek';
import {
  buildFinisherTagline,
  formatRatingDelta,
  formatWarPoints,
} from '@/lib/growth/finisherTagline';

describe('getComebackEligibility', () => {
  const now = Date.UTC(2026, 5, 1, 12, 0, 0);

  it('returns eligible when away 1–2 weeks', () => {
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(getComebackEligibility(tenDaysAgo, now)).toEqual({ eligible: true, weeksAway: 1 });
  });

  it('rejects recent activity', () => {
    const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getComebackEligibility(twoDaysAgo, now).eligible).toBe(false);
  });

  it('rejects long absence', () => {
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    expect(getComebackEligibility(monthAgo, now).eligible).toBe(false);
  });
});

describe('finisherTagline helpers', () => {
  it('builds faction division tagline', () => {
    expect(buildFinisherTagline('horde', 'rookie')).toBe('I SCORED FOR HORDE ROOKIE');
  });

  it('formats rating delta and war points', () => {
    expect(formatRatingDelta(4.2)).toBe('+4.2 RATING');
    expect(formatWarPoints(892)).toBe('+892 WAR PTS');
  });
});
