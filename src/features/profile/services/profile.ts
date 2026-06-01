import { supabase } from '@/lib/supabase';
import { PROFILE_COLUMNS } from '@/lib/profileSelect';
import {
  getProfileById as getProfileByIdFromLib,
  getProfileByUsername as getProfileByUsernameFromLib,
} from '@/lib/profile/getProfile';
import type { Profile } from '@/lib/types/database.types';

export const getProfileById = getProfileByIdFromLib;
export const getProfileByUsername = getProfileByUsernameFromLib;

export async function updateAvatarUrl(input: {
  userId: string;
  avatarUrl: string | null;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: input.avatarUrl })
    .eq('id', input.userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}
