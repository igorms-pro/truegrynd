import type { FactionRow, MemberRow } from '@/features/factions/services/clanHud';
import { supabase } from '@/lib/supabase';
import type { Division, Faction } from '@/lib/types/database.types';
import { getActiveWeeklyChallenge } from '@/lib/weekly/getActiveWeeklyChallenge';

const FACTIONS: readonly Faction[] = ['nomads', 'horde', 'iron_alliance'] as const;

type StandingRow = { faction: string; points: number; members: number };
type ContributorRow = { user_id: string; username: string; points: number };

export type FactionWarContext = {
  weeklyId: string;
  weekLabel: string | null;
  division: Division;
};

export async function getActiveFactionWarContext(
  division: Division,
): Promise<FactionWarContext | null> {
  const weekly = await getActiveWeeklyChallenge();
  if (!weekly) return null;
  return {
    weeklyId: weekly.id,
    weekLabel: weekly.week_label,
    division,
  };
}

export async function getFactionWarStandings(
  weeklyId: string,
  division: Division,
): Promise<FactionRow[]> {
  const { data, error } = await supabase.rpc('get_faction_war_standings', {
    p_weekly_challenge_id: weeklyId,
    p_division: division,
  });
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as StandingRow[];
  const byFaction = new Map(rows.map((r) => [r.faction as Faction, r]));

  return FACTIONS.map((faction) => {
    const row = byFaction.get(faction);
    return {
      faction,
      points: Number(row?.points ?? 0),
      members: row?.members ?? 0,
    };
  }).sort((a, b) => b.points - a.points);
}

export async function getFactionWarTopContributors(input: {
  weeklyId: string;
  faction: Faction;
  division: Division;
  limit?: number;
}): Promise<MemberRow[]> {
  const { weeklyId, faction, division, limit = 10 } = input;
  const { data, error } = await supabase.rpc('get_faction_war_top_contributors', {
    p_weekly_challenge_id: weeklyId,
    p_faction: faction,
    p_division: division,
    p_limit: limit,
  });
  if (error) throw new Error(error.message);

  return ((data ?? []) as ContributorRow[]).map((row) => ({
    userId: row.user_id,
    username: row.username,
    points: Number(row.points),
  }));
}

export async function getFactionWarUserContribution(
  weeklyId: string,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc('get_faction_war_user_contribution', {
    p_weekly_challenge_id: weeklyId,
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}
