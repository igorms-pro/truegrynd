export type Faction = 'nomads' | 'horde' | 'iron_alliance';
export type ScoreType = 'time' | 'reps';
export type ChallengeStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  username: string;
  sex: 'male' | 'female' | 'other';
  age: number;
  weight_kg: number;
  faction: Faction | null;
  initiation_completed: boolean;
  creator_score: number;
  streak_days: number;
  last_activity_at: string | null;
  avatar_url: string | null;
  created_at: string;
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
