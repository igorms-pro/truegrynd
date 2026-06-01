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
