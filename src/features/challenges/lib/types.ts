import type { Faction, Sex, Division } from '@/lib/types/database.types';

export type LeaderboardProfileSlim = {
  id: string;
  username: string | null;
  sex: Sex | null;
  age: number | null;
  faction: Faction | null;
  division: Division;
};

export type LeaderboardEntry = {
  id: string;
  challenge_id: string;
  user_id: string;
  value: number;
  video_url: string | null;
  is_validated: boolean;
  submitted_at: string;
  profile: LeaderboardProfileSlim | null;
};

export type LeaderboardFilters = {
  sex: Sex | null;
  ageBracket: import('@/features/challenges/lib/ageBracket').AgeBracket | null;
  faction: Faction | null;
  division: Division | null;
};

export const EMPTY_FILTERS: LeaderboardFilters = {
  sex: null,
  ageBracket: null,
  faction: null,
  division: null,
};
