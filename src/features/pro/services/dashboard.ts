import { supabase } from '@/lib/supabase';

/** Gym KPIs scoped to the caller's gym (see `gym_overview`). */
export type GymOverview = {
  memberCount: number;
  pendingCount: number;
  active7dCount: number;
};

type Row = {
  member_count: number;
  pending_count: number;
  active_7d_count: number;
};

export async function fetchGymOverview(): Promise<GymOverview> {
  const { data, error } = await supabase.rpc('gym_overview');
  if (error) throw new Error(error.message);

  const row = ((data ?? []) as Row[])[0];
  return {
    memberCount: Number(row?.member_count ?? 0),
    pendingCount: Number(row?.pending_count ?? 0),
    active7dCount: Number(row?.active_7d_count ?? 0),
  };
}
