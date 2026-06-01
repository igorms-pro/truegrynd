import { parseRivalRpcError } from '@/features/rivals/lib/rivalInviteLimits';

export function mapRivalErrorKey(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  const code = parseRivalRpcError(message);
  return code === 'unknown' ? 'generic' : code;
}
