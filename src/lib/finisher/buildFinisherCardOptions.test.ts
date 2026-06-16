import { describe, expect, it } from 'vitest';

import {
  buildFinisherCardOptionsFull,
  buildFinisherCardOptionsThumb,
  type FinisherCardLabels,
} from '@/lib/finisher/buildFinisherCardOptions';

describe('buildFinisherCardOptions', () => {
  const labels: FinisherCardLabels = {
    metricTime: 'TIME (MM:SS)',
    metricReps: 'REPS',
    saved: 'SAVED',
    ranked: 'RANKED',
    top: 'TOP',
    subNoVideo: 'NOT RANKED (NO VIDEO)',
    subValidated: 'VALIDATED',
    subWorldwide: 'WORLDWIDE (VALIDATED)',
  };

  const base = {
    faction: 'nomads' as const,
    division: 'rookie' as const,
    username: 'athlete',
    challengeTitle: 'Burpee test',
    scoreType: 'reps' as const,
    scoreValue: 50,
    labels,
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
    expect(opts.rankTextOverride).toBe('TOP 5%');
    expect(opts.metricLabel).toBe('REPS');
  });

  it('builds thumb preview options without top percent', () => {
    const opts = buildFinisherCardOptionsThumb({ ...base, ranked: false });
    expect(opts.width).toBe(360);
    expect(opts.topPercent).toBeNull();
    expect(opts.rankTextOverride).toBe('SAVED');
  });
});
