export { ArenaScreen } from '@/features/challenges/components/ArenaScreen';
export { ChallengeDetail } from '@/features/challenges/components/ChallengeDetail';
export { ChallengeCard } from '@/features/challenges/components/ChallengeCard';
export { ChallengeList } from '@/features/challenges/components/ChallengeList';
export { Leaderboard } from '@/features/challenges/components/Leaderboard';

export { useChallenges } from '@/features/challenges/hooks/useChallenges';
export { useChallenge } from '@/features/challenges/hooks/useChallenge';
export { useChallengeLeaderboard } from '@/features/challenges/hooks/useChallengeLeaderboard';

export { formatScore, formatTime, formatReps } from '@/features/challenges/lib/scoreFormat';
export { sortScoresByType } from '@/features/challenges/lib/leaderboardSort';
export {
  AGE_BRACKETS,
  ageBracketFromAge,
  isInBracket,
  type AgeBracket,
} from '@/features/challenges/lib/ageBracket';

export type {
  LeaderboardEntry,
  LeaderboardFilters,
  LeaderboardProfileSlim,
} from '@/features/challenges/lib/types';
