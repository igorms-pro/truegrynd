export type Faction = 'nomads' | 'horde' | 'iron_alliance';
export type Division = 'rookie' | 'regular' | 'savage' | 'elite';
export type ChallengeVariant = 'no_equipment' | 'bodyweight' | 'dumbbell' | 'standard' | 'savage';
export type Sex = 'male' | 'female' | 'other';
export type ScoreType = 'time' | 'reps';
export type ChallengeStatus = 'pending' | 'approved' | 'rejected';
export type ChallengeAiTier = 'green' | 'orange' | 'red';

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
  division: Division;
  initiation_completed: boolean;
  creator_score: number;
  streak_days: number;
  last_activity_at: string | null;
  avatar_url: string | null;
  is_admin: boolean;
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
  /** Set when an admin rejects the challenge; visible to the creator. */
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  /** For `time` challenges: reject submissions with time (seconds) greater than this. Omitted or null = no cap. */
  max_duration_seconds?: number | null;
  /** AI triage tier; null when not analyzed yet. */
  ai_tier?: ChallengeAiTier | null;
  ai_summary?: string | null;
  ai_model?: string | null;
  ai_checked_at?: string | null;
  /** When set and in the past, approved challenge is closed in Arena (done). */
  ends_at?: string | null;
  created_at: string;
  /** Official scaling lanes enabled for this challenge (from challenge_variants). */
  variants?: ChallengeVariant[];
}

export interface Score {
  id: string;
  challenge_id: string;
  user_id: string;
  /** Seconds for `time` challenges; integer rep count for `reps` challenges. */
  value: number;
  video_url: string | null;
  is_validated: boolean;
  variant: ChallengeVariant;
  is_hidden?: boolean;
  submitted_at: string;
  profile?: Profile;
}

export interface FactionStats {
  faction: Faction;
  total_points: number;
  member_count: number;
}
