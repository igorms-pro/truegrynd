import type { Challenge } from '@/lib/types/database.types';

export function isArenaDone(challenge: Pick<Challenge, 'status' | 'ends_at'>): boolean {
  if (challenge.status !== 'approved') return false;
  const endsAt = challenge.ends_at;
  if (!endsAt) return false;
  return new Date(endsAt).getTime() <= Date.now();
}

export function isArenaLive(challenge: Pick<Challenge, 'status' | 'ends_at'>): boolean {
  return challenge.status === 'approved' && !isArenaDone(challenge);
}

export type ArenaDisplayStatus = 'pending' | 'rejected' | 'arena_live' | 'arena_done';

export function arenaDisplayStatus(
  challenge: Pick<Challenge, 'status' | 'ends_at'>,
): ArenaDisplayStatus {
  if (challenge.status === 'pending') return 'pending';
  if (challenge.status === 'rejected') return 'rejected';
  return isArenaDone(challenge) ? 'arena_done' : 'arena_live';
}
