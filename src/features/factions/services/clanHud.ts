import {
  getActiveFactionWarContext,
  getFactionWarStandings,
  getFactionWarTopContributors,
  getFactionWarUserContribution,
  type FactionWarContext,
} from '@/features/factions/services/factionWar';
import { supabase } from '@/lib/supabase';
import type { Division, Faction, Profile, ScoreType } from '@/lib/types/database.types';

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

export type ClanHudData = {
  rankings: FactionRow[];
  members: MemberRow[];
  war: FactionWarContext | null;
  myContribution: number;
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

async function getLegacyClanHudData(input: {
  faction: Faction;
  limit: number;
  sampleLimit: number;
}): Promise<Pick<ClanHudData, 'rankings' | 'members'>> {
  const rows = await listRecentValidatedScores(input.sampleLimit);
  return {
    rankings: computeFactionRankings(rows),
    members: computeTopMembersByFaction(rows, input.faction, input.limit),
  };
}

export async function getClanHudData(input: {
  faction: Faction;
  division: Division;
  userId?: string | null;
  limit?: number;
  sampleLimit?: number;
}): Promise<ClanHudData> {
  const { faction, division, userId = null, limit = 10, sampleLimit = 1000 } = input;

  const war = await getActiveFactionWarContext(division);
  if (war) {
    const [rankings, members, myContribution] = await Promise.all([
      getFactionWarStandings(war.weeklyId, division),
      getFactionWarTopContributors({
        weeklyId: war.weeklyId,
        faction,
        division,
        limit,
      }),
      userId ? getFactionWarUserContribution(war.weeklyId, userId) : Promise.resolve(0),
    ]);
    return { rankings, members, war, myContribution };
  }

  const legacy = await getLegacyClanHudData({ faction, limit, sampleLimit });
  return { ...legacy, war: null, myContribution: 0 };
}

export type FactionProofRow = {
  id: string;
  username: string;
  value: number;
  scoreType: ScoreType;
  challengeTitle: string;
  videoUrl: string;
};

type RawProofRow = {
  id: string;
  value: number;
  video_url: string | null;
  profile: Pick<Profile, 'username' | 'faction'> | null;
  challenge: { title: string; score_type: ScoreType } | null;
};

const PROOF_SELECT =
  'id,value,video_url,submitted_at,profile:profiles!scores_user_id_fkey(username,faction),challenge:challenges!scores_challenge_id_fkey(title,score_type)';

/** Recent validated, video-backed scores from a faction's members. */
export async function listRecentFactionVideos(
  faction: Faction,
  limit = 6,
): Promise<FactionProofRow[]> {
  const { data, error } = await supabase
    .from('scores')
    .select(PROOF_SELECT)
    .eq('is_validated', true)
    .not('video_url', 'is', null)
    .order('submitted_at', { ascending: false })
    .limit(80);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as RawProofRow[];
  return rows
    .filter(
      (r) => r.profile?.faction === faction && r.profile.username && r.video_url && r.challenge,
    )
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      username: r.profile!.username as string,
      value: r.value,
      scoreType: r.challenge!.score_type,
      challengeTitle: r.challenge!.title,
      videoUrl: r.video_url as string,
    }));
}
