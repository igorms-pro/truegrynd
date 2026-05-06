import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types/database.types';

const PROFILE_SELECT =
  'id,username,sex,age,weight_kg,faction,initiation_completed,creator_score,streak_days,last_activity_at,avatar_url,created_at,updated_at';

export async function getProfileById(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', userId)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}

export async function updateAvatarUrl(input: {
  userId: string;
  avatarUrl: string | null;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_url: input.avatarUrl })
    .eq('id', input.userId)
    .select(PROFILE_SELECT)
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}
