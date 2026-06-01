import { PROFILE_COLUMNS } from '@/lib/profileSelect';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types/database.types';

export async function getProfileById(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}

export async function getProfileByUsername(username: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('username', username)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}
