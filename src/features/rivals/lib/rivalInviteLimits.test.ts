import { describe, expect, it } from 'vitest';

import {
  isPendingInviteLimitReached,
  MAX_PENDING_RIVAL_INVITES,
  parseRivalRpcError,
} from '@/features/rivals/lib/rivalInviteLimits';

describe('rivalInviteLimits', () => {
  it('blocks at max pending invites', () => {
    expect(isPendingInviteLimitReached(MAX_PENDING_RIVAL_INVITES - 1)).toBe(false);
    expect(isPendingInviteLimitReached(MAX_PENDING_RIVAL_INVITES)).toBe(true);
  });

  it('parses known RPC errors from Supabase messages', () => {
    expect(parseRivalRpcError('division_mismatch')).toBe('division_mismatch');
    expect(parseRivalRpcError('ERROR: too_many_pending_invites_sent')).toBe(
      'too_many_pending_invites_sent',
    );
    expect(parseRivalRpcError('something else')).toBe('unknown');
  });
});
