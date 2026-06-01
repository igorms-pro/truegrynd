import type { ProofMinFilter } from '@/lib/proof/proofLevel';
import type {
  Faction,
  Sex,
  Division,
  ChallengeVariant,
  ProofLevel,
} from '@/lib/types/database.types';

export type LeaderboardProfileSlim = {
  id: string;
  username: string | null;
  sex: Sex | null;
  age: number | null;
  faction: Faction | null;
  division: Division;
  city: string | null;
  country_code: string | null;
  show_location_on_leaderboard: boolean;
};

export type LeaderboardEntry = {
  id: string;
  challenge_id: string;
  user_id: string;
  value: number;
  video_url: string | null;
  is_validated: boolean;
  proof_level: ProofLevel;
  variant: ChallengeVariant;
  submitted_at: string;
  profile: LeaderboardProfileSlim | null;
};

export type LeaderboardFilters = {
  sex: Sex | null;
  ageBracket: import('@/features/challenges/lib/ageBracket').AgeBracket | null;
  faction: Faction | null;
  division: Division | null;
  variant: ChallengeVariant | null;
  /** Normalized lowercase city for matching. */
  city: string | null;
  /** ISO 3166-1 alpha-2 uppercase. */
  countryCode: string | null;
  proofMin: ProofMinFilter | null;
};

export const EMPTY_FILTERS: LeaderboardFilters = {
  sex: null,
  ageBracket: null,
  faction: null,
  division: null,
  variant: null,
  city: null,
  countryCode: null,
  proofMin: null,
};
