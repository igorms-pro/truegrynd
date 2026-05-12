import { supabase } from '@/lib/supabase';
import { PROFILE_COLUMNS } from '@/lib/profileSelect';
import type { Faction, Profile, Sex } from '@/lib/types/database.types';

export async function fetchOrEnsureProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (data) return data;

  const { data: upserted, error: upsertError } = await supabase
    .from('profiles')
    .upsert({ id: userId }, { onConflict: 'id' })
    .select(PROFILE_COLUMNS)
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
    .select(PROFILE_COLUMNS)
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
    .select(PROFILE_COLUMNS)
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
    .select(PROFILE_COLUMNS)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile missing after set faction');
  return data;
}
