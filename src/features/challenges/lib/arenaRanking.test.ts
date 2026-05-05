import { describe, expect, it } from 'vitest';

import { rankChallenges } from '@/features/challenges/lib/arenaRanking';
import type { Challenge } from '@/lib/types/database.types';

const c = (id: string, opts: Partial<Challenge> = {}): Challenge => ({
  id,
  title: id,
  description: 'd',
  rules: 'r',
  score_type: 'time',
  equipment_tags: [],
  is_official: false,
  status: 'approved',
  creator_id: null,
  created_at: '2025-01-01T00:00:00Z',
  ...opts,
});

describe('rankChallenges', () => {
  it('sorts new by created_at desc', () => {
    const list = [
      c('a', { created_at: '2025-01-01T00:00:00Z' }),
      c('b', { created_at: '2025-02-01T00:00:00Z' }),
    ];
    expect(rankChallenges(list, 'new').map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('sorts trending by official first, then created_at desc', () => {
    const list = [
      c('a', { is_official: false, created_at: '2025-03-01T00:00:00Z' }),
      c('b', { is_official: true, created_at: '2025-01-01T00:00:00Z' }),
      c('c', { is_official: true, created_at: '2025-04-01T00:00:00Z' }),
    ];
    expect(rankChallenges(list, 'trending').map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });
});
