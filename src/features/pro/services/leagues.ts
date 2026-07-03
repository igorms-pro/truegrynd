import { supabase } from '@/lib/supabase';

export type LeagueScope = 'local' | 'regional' | 'national';

/** A league in the directory, with the caller's gym membership state. */
export type League = {
  id: string;
  name: string;
  scope: LeagueScope;
  regionCode: string | null;
  memberCount: number;
  isMember: boolean;
};

type Row = {
  id: string;
  name: string;
  scope: LeagueScope;
  region_code: string | null;
  member_count: number;
  is_member: boolean;
};

export async function listLeagues(): Promise<League[]> {
  const { data, error } = await supabase.rpc('league_directory');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    name: row.name,
    scope: row.scope,
    regionCode: row.region_code,
    memberCount: Number(row.member_count ?? 0),
    isMember: row.is_member,
  }));
}

/** A member gym's row in the league standings. */
export type LeagueStanding = {
  gymId: string;
  gymName: string;
  gymSlug: string;
  memberCount: number;
  ratedCount: number;
  avgRating: number;
};

export async function getLeagueStandings(leagueId: string): Promise<LeagueStanding[]> {
  const { data, error } = await supabase.rpc('league_standings', { p_league_id: leagueId });
  if (error) throw new Error(error.message);
  return (
    (data ?? []) as Array<{
      gym_id: string;
      gym_name: string;
      gym_slug: string;
      member_count: number;
      rated_count: number;
      avg_rating: number;
    }>
  ).map((r) => ({
    gymId: r.gym_id,
    gymName: r.gym_name,
    gymSlug: r.gym_slug,
    memberCount: Number(r.member_count ?? 0),
    ratedCount: Number(r.rated_count ?? 0),
    avgRating: Number(r.avg_rating ?? 0),
  }));
}

export async function joinLeague(leagueId: string): Promise<void> {
  const { error } = await supabase.rpc('join_league', { p_league_id: leagueId });
  if (error) throw new Error(error.message);
}

export async function leaveLeague(leagueId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_league', { p_league_id: leagueId });
  if (error) throw new Error(error.message);
}
