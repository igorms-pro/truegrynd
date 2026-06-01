import type { ScoreType } from '@/lib/types/database.types';

const EVENT_POINTS_CAP = 10_000;
const TIME_VALUE_CAP = 9_999;

/** Maps score value to event points (mirrors SQL `faction_war_contribution_points`). */
export function eventScorePoints(value: number, scoreType: ScoreType): number {
  const safe = Number.isFinite(value) ? value : 0;
  if (scoreType === 'time') {
    return Math.max(0, EVENT_POINTS_CAP - Math.min(Math.max(safe, 0), TIME_VALUE_CAP));
  }
  return Math.min(Math.max(safe, 0), EVENT_POINTS_CAP);
}

export type EventStandingRow = {
  userId: string;
  username: string;
  totalPoints: number;
  challengesScored: number;
};

/** Aggregate event_scores rows into overall standings (sum points per user). */
export function aggregateEventStandings(
  rows: readonly { userId: string; username: string; points: number; challengeId: string }[],
): EventStandingRow[] {
  const byUser = new Map<string, EventStandingRow>();

  for (const row of rows) {
    const existing = byUser.get(row.userId);
    if (!existing) {
      byUser.set(row.userId, {
        userId: row.userId,
        username: row.username,
        totalPoints: row.points,
        challengesScored: 1,
      });
      continue;
    }
    existing.totalPoints += row.points;
    existing.challengesScored += 1;
  }

  return [...byUser.values()].sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.challengesScored - a.challengesScored ||
      a.username.localeCompare(b.username),
  );
}
