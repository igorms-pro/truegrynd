import { describe, expect, it } from 'vitest';

import { arenaDisplayStatus, isArenaDone, isArenaLive } from '@/features/admin/lib/arenaLifecycle';

describe('arenaLifecycle', () => {
  it('treats approved without ends_at as live', () => {
    const c = { status: 'approved' as const, ends_at: null };
    expect(isArenaLive(c)).toBe(true);
    expect(isArenaDone(c)).toBe(false);
    expect(arenaDisplayStatus(c)).toBe('arena_live');
  });

  it('treats approved with past ends_at as done', () => {
    const c = { status: 'approved' as const, ends_at: '2020-01-01T00:00:00Z' };
    expect(isArenaDone(c)).toBe(true);
    expect(isArenaLive(c)).toBe(false);
    expect(arenaDisplayStatus(c)).toBe('arena_done');
  });
});
