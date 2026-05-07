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

function addPoints(base: number, value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  if (safe <= 0) return base;
  // Simple, cross-challenge heuristic:
  // - reps: contributes directly
  // - time: contributes indirectly (smaller time => bigger value) but we don't have score_type here
  // So we treat this as "war points" = value, capped to keep outliers reasonable.
  return base + Math.min(safe, 10_000);
}

export async function getFactionRankings(limit = 500): Promise<FactionRow[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('is_validated', true)
    .order('submitted_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawScoreRow[];
  const map = initFactionMap();

  for (const row of rows) {
    const faction = row.profile?.faction ?? null;
    const userId = row.profile?.id ?? null;
    if (!faction || !userId) continue;

    const entry = map.get(faction);
    if (!entry) continue;
    entry.points = addPoints(entry.points, row.value);
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

export async function getTopMembersByFaction(input: {
  faction: Faction;
  limit?: number;
  sampleLimit?: number;
}): Promise<MemberRow[]> {
  const { limit = 10, sampleLimit = 1000 } = input;

  const { data, error } = await supabase
    .from('scores')
    .select(SCORE_SELECT)
    .eq('is_validated', true)
    .order('submitted_at', { ascending: false })
    .limit(sampleLimit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawScoreRow[];
  const byUser = new Map<string, MemberRow>();

  for (const row of rows) {
    const profile = row.profile;
    if (!profile?.id || !profile.username || profile.faction !== input.faction) continue;

    const prev = byUser.get(profile.id) ?? {
      userId: profile.id,
      username: profile.username,
      points: 0,
    };
    byUser.set(profile.id, { ...prev, points: addPoints(prev.points, row.value) });
  }

  return [...byUser.values()].sort((a, b) => b.points - a.points).slice(0, limit);
}
