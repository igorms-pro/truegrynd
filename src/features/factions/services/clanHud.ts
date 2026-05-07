import { supabase } from '@/lib/supabase';
import type { Faction, Profile } from '@/lib/types/database.types';

export type FactionRow = {
  faction: Faction;
  points: number;
  members: number;
};

export type MemberRow = {
  userId: string;
  username: string;
  points: number;
};

type RawScoreRow = {
  value: number;
  profile: Pick<Profile, 'id' | 'username' | 'faction'> | null;
};

const SCORE_SELECT = 'value,profile:profiles!scores_user_id_fkey(id,username,faction)';

const FACTIONS: readonly Faction[] = ['nomads', 'horde', 'iron_alliance'] as const;

function initFactionMap(): Map<Faction, { points: number; members: Set<string> }> {
  const map = new Map<Faction, { points: number; members: Set<string> }>();
  for (const f of FACTIONS) map.set(f, { points: 0, members: new Set<string>() });
  return map;
}

function addWarPoints(base: number, value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  if (safe <= 0) return base;
  // Simple cross-challenge heuristic: treats `scores.value` as contribution.
  // This is intentionally a temporary "Clan HUD" metric until server-side faction totals exist.
  return base + Math.min(safe, 10_000);
}

async function listRecentValidatedScores(limit: number): Promise<RawScoreRow[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('is_validated', true)
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RawScoreRow[];
}

function computeFactionRankings(rows: readonly RawScoreRow[]): FactionRow[] {
  const map = initFactionMap();

  for (const row of rows) {
    const faction = row.profile?.faction ?? null;
    const userId = row.profile?.id ?? null;
    if (!faction || !userId) continue;

    const entry = map.get(faction);
    if (!entry) continue;
    entry.points = addWarPoints(entry.points, row.value);
    entry.members.add(userId);
  }

  return FACTIONS.map((faction) => {
    const entry = map.get(faction);
    return {
      faction,
      points: entry?.points ?? 0,
      members: entry?.members.size ?? 0,
    };
  }).sort((a, b) => b.points - a.points);
}

function computeTopMembersByFaction(
  rows: readonly RawScoreRow[],
  faction: Faction,
  limit: number,
): MemberRow[] {
  const byUser = new Map<string, MemberRow>();

  for (const row of rows) {
    const profile = row.profile;
    if (!profile?.id || !profile.username || profile.faction !== faction) continue;

    const prev = byUser.get(profile.id) ?? {
      userId: profile.id,
      username: profile.username,
      points: 0,
    };
    byUser.set(profile.id, { ...prev, points: addWarPoints(prev.points, row.value) });
  }

  return [...byUser.values()].sort((a, b) => b.points - a.points).slice(0, limit);
}

export async function getClanHudData(input: {
  faction: Faction;
  limit?: number;
  sampleLimit?: number;
}): Promise<{ rankings: FactionRow[]; members: MemberRow[] }> {
  const { faction, limit = 10, sampleLimit = 1000 } = input;
  const rows = await listRecentValidatedScores(sampleLimit);
  return {
    rankings: computeFactionRankings(rows),
    members: computeTopMembersByFaction(rows, faction, limit),
  };
}
