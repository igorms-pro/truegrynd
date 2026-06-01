export const MAX_PENDING_RIVAL_INVITES = 5;

export function isPendingInviteLimitReached(pendingCount: number): boolean {
  return pendingCount >= MAX_PENDING_RIVAL_INVITES;
}

export type RivalRpcErrorCode =
  | 'too_many_pending_invites_sent'
  | 'invitee_too_many_pending'
  | 'division_mismatch'
  | 'invitee_not_found'
  | 'cannot_invite_self'
  | 'invalid_challenge_count'
  | 'invalid_duration'
  | 'not_invited'
  | 'match_not_pending'
  | 'cannot_cancel';

export function parseRivalRpcError(message: string): RivalRpcErrorCode | 'unknown' {
  const codes: RivalRpcErrorCode[] = [
    'too_many_pending_invites_sent',
    'invitee_too_many_pending',
    'division_mismatch',
    'invitee_not_found',
    'cannot_invite_self',
    'invalid_challenge_count',
    'invalid_duration',
    'not_invited',
    'match_not_pending',
    'cannot_cancel',
  ];

  for (const code of codes) {
    if (message.includes(code)) return code;
  }

  return 'unknown';
}
