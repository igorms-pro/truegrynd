import type { PassportPrivacySettings } from '@/features/profile/lib/passportPrivacy';
import { PROFILE_COLUMNS } from '@/lib/profileSelect';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types/database.types';

export async function updatePassportPrivacy(input: {
  userId: string;
  settings: PassportPrivacySettings;
}): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      show_division_on_public: input.settings.showDivisionOnPublic,
      show_rating_on_public: input.settings.showRatingOnPublic,
      show_score_history_on_public: input.settings.showScoreHistoryOnPublic,
      show_top_scores_on_public: input.settings.showTopScoresOnPublic,
      show_badges_on_public: input.settings.showBadgesOnPublic,
      show_weeklies_on_public: input.settings.showWeekliesOnPublic,
      show_finishers_on_public: input.settings.showFinishersOnPublic,
      show_rival_wins_on_public: input.settings.showRivalWinsOnPublic,
    })
    .eq('id', input.userId)
    .select(PROFILE_COLUMNS)
    .maybeSingle<Profile>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('profile_not_found');
  return data;
}
