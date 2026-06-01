import { describe, expect, it } from 'vitest';

import {
  aggregateFactionWarStandings,
  FACTION_WAR_PARTICIPATION_BONUS,
  FACTION_WAR_TOP_N,
  factionWarContributionPoints,
} from '@/features/factions/lib/factionWarPoints';

describe('factionWarContributionPoints', () => {
  it('caps rep contributions at 10000', () => {
    expect(factionWarContributionPoints(50, 'reps')).toBe(50);
    expect(factionWarContributionPoints(50_000, 'reps')).toBe(10_000);
  });

  it('inverts time so faster scores earn more war points', () => {
    expect(factionWarContributionPoints(120, 'time')).toBe(9880);
    expect(factionWarContributionPoints(120, 'time')).toBeGreaterThan(
      factionWarContributionPoints(300, 'time'),
    );
  });
});

describe('aggregateFactionWarStandings', () => {
  it('sums top N plus participation bonus per fighter', () => {
    const contributions = [
      { faction: 'horde', contributionPoints: 100 },
      { faction: 'horde', contributionPoints: 80 },
      { faction: 'horde', contributionPoints: 60 },
      { faction: 'nomads', contributionPoints: 200 },
    ];

    const totals = aggregateFactionWarStandings(contributions, 2, 5);
    const horde = totals.get('horde');
    const nomads = totals.get('nomads');

    expect(horde).toEqual({ points: 100 + 80 + 3 * FACTION_WAR_PARTICIPATION_BONUS, members: 3 });
    expect(nomads).toEqual({ points: 200 + 1 * FACTION_WAR_PARTICIPATION_BONUS, members: 1 });
  });

  it('uses default top N of 10', () => {
    const rows = Array.from({ length: 12 }, (_, i) => ({
      faction: 'iron_alliance',
      contributionPoints: 100 - i,
    }));
    const totals = aggregateFactionWarStandings(rows);
    const entry = totals.get('iron_alliance');
    const topSum = Array.from({ length: FACTION_WAR_TOP_N }, (_, i) => 100 - i).reduce(
      (a, b) => a + b,
      0,
    );
    expect(entry?.points).toBe(topSum + 12 * FACTION_WAR_PARTICIPATION_BONUS);
    expect(entry?.members).toBe(12);
  });
});
