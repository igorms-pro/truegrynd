import { supabase } from '@/lib/supabase';

/** An athlete affiliated to the caller's gym (see `gym_members`). */
export type GymMember = {
  id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  avatarUrl: string | null;
  lastActivityAt: string | null;
};

type Row = {
  id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  avatar_url: string | null;
  last_activity_at: string | null;
};

export async function listGymMembers(): Promise<GymMember[]> {
  const { data, error } = await supabase.rpc('gym_members');
  if (error) throw new Error(error.message);

  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    username: row.username,
    division: row.division,
    faction: row.faction,
    avatarUrl: row.avatar_url,
    lastActivityAt: row.last_activity_at,
  }));
}
