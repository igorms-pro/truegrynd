import { supabase } from '@/lib/supabase';
import type { Faction, Profile, Sex } from '@/lib/types/database.types';

const PROFILE_SELECT =
  'id,username,sex,age,weight_kg,faction,initiation_completed,creator_score,streak_days,last_activity_at,avatar_url,created_at,updated_at';

export async function fetchOrEnsureProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (data) return data;

  const { data: upserted, error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id' })
    .select(PROFILE_SELECT)
    .maybeSingle<Profile>();

  if (upsertError) throw new Error(upsertError.message);
  if (!upserted) throw new Error('profile missing after upsert');
  return upserted;
}

export async function upsertIdentity(input: {
  userId: string;
  username: string;
  sex: Sex;
  age: number;
  weightKg: number;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: input.userId,
        username: input.username,
        sex: input.sex,
        age: input.age,
        weight_kg: input.weightKg,
      },
      { onConflict: 'id' },
    )
    .select(PROFILE_SELECT)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile missing after upsert identity');
  return data;
}

export async function completeInitiation(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ initiation_completed: true })
    .eq('id', userId)
    .select(PROFILE_SELECT)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile missing after complete initiation');
  return data;
}

export async function setFaction(input: { userId: string; faction: Faction }): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ faction: input.faction })
    .eq('id', input.userId)
    .select(PROFILE_SELECT)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile missing after set faction');
  return data;
}
