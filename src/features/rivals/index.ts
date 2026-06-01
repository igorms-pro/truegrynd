export { CreateRivalMatchScreen } from '@/features/rivals/components/CreateRivalMatchScreen';
export { RivalHubLink } from '@/features/rivals/components/RivalHubLink';
export { RivalMatchesScreen } from '@/features/rivals/components/RivalMatchesScreen';
export { useCreateRivalMatch } from '@/features/rivals/hooks/useCreateRivalMatch';
export { useMyRivalMatches } from '@/features/rivals/hooks/useMyRivalMatches';
export { useRivalMatch } from '@/features/rivals/hooks/useRivalMatch';
export {
  MAX_PENDING_RIVAL_INVITES,
  parseRivalRpcError,
} from '@/features/rivals/lib/rivalInviteLimits';
export { resolveRivalWinner } from '@/features/rivals/lib/resolveRivalWinner';
export {
  cancelRivalMatch,
  computeRivalWinnerFromScores,
  createRivalMatch,
  fetchRivalMatch,
  listMyRivalMatches,
  respondRivalMatchInvite,
} from '@/features/rivals/services/rivalMatches';
export type {
  RivalMatchChallengeView,
  RivalMatchParticipantView,
  RivalMatchView,
} from '@/features/rivals/services/rivalMatches';
