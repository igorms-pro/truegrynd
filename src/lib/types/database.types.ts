export type Faction = 'nomads' | 'horde' | 'iron_alliance';
export type Sex = 'male' | 'female' | 'other';
export type ScoreType = 'time' | 'reps';
export type ChallengeStatus = 'pending' | 'approved' | 'rejected';

/**
 * Mirrors the `profiles` table.
 * username/sex/age/weight_kg are NULL until onboarding is complete.
 * Use `isProfileComplete()` to check readiness before entering the app.
 */
export interface Profile {
  id: string;
  username: string | null;
  sex: Sex | null;
  age: number | null;
  weight_kg: number | null;
  faction: Faction | null;
  initiation_completed: boolean;
  creator_score: number;
  streak_days: number;
  last_activity_at: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** A profile guaranteed to have all onboarding fields filled in. */
export type CompleteProfile = Profile & {
  username: string;
  sex: Sex;
  age: number;
  weight_kg: number;
  faction: Faction;
};

export function isProfileComplete(p: Profile): p is CompleteProfile {
  return (
    p.username !== null &&
    p.sex !== null &&
    p.age !== null &&
    p.weight_kg !== null &&
    p.faction !== null &&
    p.initiation_completed
  );
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rules: string;
  score_type: ScoreType;
  equipment_tags: string[];
  is_official: boolean;
  status: ChallengeStatus;
  creator_id: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  challenge_id: string;
  user_id: string;
  /** Seconds for `time` challenges; integer rep count for `reps` challenges. */
  value: number;
  video_url: string | null;
  is_validated: boolean;
  submitted_at: string;
  profile?: Profile;
}

export interface FactionStats {
  faction: Faction;
  total_points: number;
  member_count: number;
}
