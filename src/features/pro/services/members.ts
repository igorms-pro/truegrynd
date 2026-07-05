import { supabase } from '@/lib/supabase';

/** An athlete affiliated to the caller's gym (see `gym_members`). */
export type GymMember = {
  id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  sex: string | null;
  age: number | null;
  weightKg: number | null;
  verifiedCount: number;
  avatarUrl: string | null;
  lastActivityAt: string | null;
};

type Row = {
  id: string;
  username: string | null;
  division: string | null;
  faction: string | null;
  sex: string | null;
  age: number | null;
  weight_kg: number | null;
  verified_count: number | null;
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
    sex: row.sex,
    age: row.age,
    weightKg: row.weight_kg == null ? null : Number(row.weight_kg),
    verifiedCount: Number(row.verified_count ?? 0),
    avatarUrl: row.avatar_url,
    lastActivityAt: row.last_activity_at,
  }));
}
