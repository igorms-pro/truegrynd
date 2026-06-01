import type { ScoreType } from '@/lib/types/database.types';

const WAR_POINTS_CAP = 10_000;
const TIME_VALUE_CAP = 9_999;

/** Maps score value to faction war contribution points (mirrors SQL `faction_war_contribution_points`). */
export function factionWarContributionPoints(value: number, scoreType: ScoreType): number {
  const safe = Number.isFinite(value) ? value : 0;
  if (scoreType === 'time') {
    return Math.max(0, WAR_POINTS_CAP - Math.min(Math.max(safe, 0), TIME_VALUE_CAP));
  }
  return Math.min(Math.max(safe, 0), WAR_POINTS_CAP);
}

export const FACTION_WAR_TOP_N = 10;
export const FACTION_WAR_PARTICIPATION_BONUS = 5;

export type FactionWarStandingInput = {
  faction: string;
  contributionPoints: number;
};

/** Server-aligned aggregate: top N contributions + participation bonus per fighter. */
export function aggregateFactionWarStandings(
  contributions: readonly FactionWarStandingInput[],
  topN: number = FACTION_WAR_TOP_N,
  participationBonus: number = FACTION_WAR_PARTICIPATION_BONUS,
): Map<string, { points: number; members: number }> {
  const byFaction = new Map<string, number[]>();

  for (const row of contributions) {
    const list = byFaction.get(row.faction) ?? [];
    list.push(row.contributionPoints);
    byFaction.set(row.faction, list);
  }

  const totals = new Map<string, { points: number; members: number }>();
  for (const [faction, pointsList] of byFaction) {
    const sorted = [...pointsList].sort((a, b) => b - a);
    const topSlice = sorted.slice(0, Math.max(topN, 1));
    const topSum = topSlice.reduce((sum, n) => sum + n, 0);
    totals.set(faction, {
      points: topSum + pointsList.length * participationBonus,
      members: pointsList.length,
    });
  }

  return totals;
}
