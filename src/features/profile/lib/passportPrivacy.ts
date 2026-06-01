import type { Profile } from '@/lib/types/database.types';

export type PassportPrivacySettings = {
  showDivisionOnPublic: boolean;
  showRatingOnPublic: boolean;
  showScoreHistoryOnPublic: boolean;
  showTopScoresOnPublic: boolean;
  showBadgesOnPublic: boolean;
  showWeekliesOnPublic: boolean;
  showFinishersOnPublic: boolean;
  showRivalWinsOnPublic: boolean;
};

export type PassportPrivacyKey = keyof PassportPrivacySettings;

export const PASSPORT_PRIVACY_KEYS: PassportPrivacyKey[] = [
  'showDivisionOnPublic',
  'showRatingOnPublic',
  'showScoreHistoryOnPublic',
  'showTopScoresOnPublic',
  'showBadgesOnPublic',
  'showWeekliesOnPublic',
  'showFinishersOnPublic',
  'showRivalWinsOnPublic',
];

export function parsePassportPrivacy(profile: Profile): PassportPrivacySettings {
  return {
    showDivisionOnPublic: profile.show_division_on_public ?? true,
    showRatingOnPublic: profile.show_rating_on_public ?? true,
    showScoreHistoryOnPublic: profile.show_score_history_on_public ?? true,
    showTopScoresOnPublic: profile.show_top_scores_on_public ?? true,
    showBadgesOnPublic: profile.show_badges_on_public ?? true,
    showWeekliesOnPublic: profile.show_weeklies_on_public ?? true,
    showFinishersOnPublic: profile.show_finishers_on_public ?? true,
    showRivalWinsOnPublic: profile.show_rival_wins_on_public ?? true,
  };
}

export function hasPublicPassportContent(privacy: PassportPrivacySettings): boolean {
  return PASSPORT_PRIVACY_KEYS.some((key) => privacy[key]);
}
