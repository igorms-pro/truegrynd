import { describe, expect, it } from 'vitest';

import {
  buildFinisherCardOptionsFull,
  buildFinisherCardOptionsThumb,
} from '@/lib/finisher/buildFinisherCardOptions';

describe('buildFinisherCardOptions', () => {
  const base = {
    faction: 'nomads' as const,
    division: 'rookie' as const,
    username: 'athlete',
    challengeTitle: 'Burpee test',
    scoreType: 'reps' as const,
    scoreValue: 50,
  };

  it('builds full-size canvas options', () => {
    const opts = buildFinisherCardOptionsFull({
      ...base,
      ranked: true,
      isValidated: true,
      topPercent: 5,
    });
    expect(opts.width).toBe(1080);
    expect(opts.height).toBe(1920);
    expect(opts.topPercent).toBe(5);
    expect(opts.rankTextOverride).toBe('RANKED');
  });

  it('builds thumb preview options without top percent', () => {
    const opts = buildFinisherCardOptionsThumb({ ...base, ranked: false });
    expect(opts.width).toBe(360);
    expect(opts.topPercent).toBeNull();
    expect(opts.rankTextOverride).toBe('SAVED');
  });
});
