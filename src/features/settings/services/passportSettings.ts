import { PROFILE_COLUMNS } from '@/lib/profileSelect';
import { sanitizeCityInput, normalizeCountryCode } from '@/lib/location';
import { supabase } from '@/lib/supabase';
import type { Profile, Sex } from '@/lib/types/database.types';

export async function upsertPassportSettings(input: {
  userId: string;
  username: string;
  sex: Sex;
  age: number;
  weightKg: number;
  city: string | null;
  countryCode: string | null;
  showLocationOnLeaderboard: boolean;
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
        city: sanitizeCityInput(input.city ?? '') ?? null,
        country_code: normalizeCountryCode(input.countryCode),
        show_location_on_leaderboard: input.showLocationOnLeaderboard,
      },
      { onConflict: 'id' },
    )
    .select(PROFILE_COLUMNS)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile missing after upsert passport');
  return data;
}
