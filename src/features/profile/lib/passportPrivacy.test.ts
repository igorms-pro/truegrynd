import { describe, expect, it } from 'vitest';

import {
  hasPublicPassportContent,
  parsePassportPrivacy,
} from '@/features/profile/lib/passportPrivacy';
import type { Profile } from '@/lib/types/database.types';

const baseProfile: Profile = {
  id: 'u1',
  username: 'athlete',
  sex: 'male',
  age: 28,
  weight_kg: 80,
  faction: 'horde',
  division: 'regular',
  city: null,
  country_code: null,
  show_location_on_leaderboard: false,
  show_division_on_public: true,
  show_rating_on_public: true,
  show_score_history_on_public: true,
  show_top_scores_on_public: true,
  show_badges_on_public: true,
  show_weeklies_on_public: true,
  show_finishers_on_public: true,
  initiation_completed: true,
  creator_score: 0,
  streak_days: 3,
  last_activity_at: null,
  avatar_url: null,
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('parsePassportPrivacy', () => {
  it('defaults missing flags to visible', () => {
    const profile = { ...baseProfile, show_rating_on_public: undefined as unknown as boolean };
    expect(parsePassportPrivacy(profile).showRatingOnPublic).toBe(true);
  });

  it('respects opt-out flags', () => {
    const profile = { ...baseProfile, show_top_scores_on_public: false };
    expect(parsePassportPrivacy(profile).showTopScoresOnPublic).toBe(false);
  });
});

describe('hasPublicPassportContent', () => {
  it('returns false when every section is hidden', () => {
    const privacy = parsePassportPrivacy({
      ...baseProfile,
      show_division_on_public: false,
      show_rating_on_public: false,
      show_score_history_on_public: false,
      show_top_scores_on_public: false,
      show_badges_on_public: false,
      show_weeklies_on_public: false,
      show_finishers_on_public: false,
    });
    expect(hasPublicPassportContent(privacy)).toBe(false);
  });
});
