import { describe, expect, it } from 'vitest';

import { applyLeaderboardFilters } from '@/features/challenges/lib/applyFilters';
import { EMPTY_FILTERS, type LeaderboardEntry } from '@/features/challenges/lib/types';

const entry = (
  id: string,
  overrides: Partial<LeaderboardEntry['profile']> = {},
  variant: LeaderboardEntry['variant'] = 'standard',
): LeaderboardEntry => ({
  id,
  challenge_id: 'c1',
  user_id: id,
  value: 60,
  video_url: null,
  is_validated: true,
  proof_level: 'video_ranked',
  variant,
  submitted_at: '2025-01-01T00:00:00Z',
  profile: {
    id: `p-${id}`,
    username: id,
    sex: 'male',
    age: 25,
    faction: 'horde',
    division: 'rookie',
    city: null,
    country_code: null,
    show_location_on_leaderboard: false,
    ...overrides,
  },
});

describe('applyLeaderboardFilters', () => {
  it('returns all entries when filters are empty', () => {
    const list = [entry('a'), entry('b')];
    expect(applyLeaderboardFilters(list, EMPTY_FILTERS)).toHaveLength(2);
  });

  it('filters by sex', () => {
    const list = [entry('a', { sex: 'male' }), entry('b', { sex: 'female' })];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, sex: 'female' }).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('filters by faction', () => {
    const list = [
      entry('a', { faction: 'horde' }),
      entry('b', { faction: 'nomads' }),
      entry('c', { faction: 'iron_alliance' }),
    ];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, faction: 'nomads' }).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('filters by division', () => {
    const list = [
      entry('a', { division: 'rookie' }),
      entry('b', { division: 'savage' }),
      entry('c', { division: 'elite' }),
    ];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, division: 'savage' }).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('filters by variant', () => {
    const list = [
      entry('a', {}, 'standard'),
      entry('b', {}, 'bodyweight'),
      entry('c', {}, 'savage'),
    ];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, variant: 'bodyweight' }).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('filters by age bracket', () => {
    const list = [entry('a', { age: 22 }), entry('b', { age: 35 }), entry('c', { age: 55 })];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, ageBracket: '30-39' }).map((e) => e.id),
    ).toEqual(['b']);
  });

  it('drops entries without an attached profile', () => {
    const list: LeaderboardEntry[] = [entry('a'), { ...entry('b'), profile: null }];
    expect(applyLeaderboardFilters(list, EMPTY_FILTERS).map((e) => e.id)).toEqual(['a']);
  });

  it('filters by normalized city', () => {
    const list = [
      entry('a', { city: 'Paris' }),
      entry('b', { city: 'Lyon' }),
      entry('c', { city: '  paris  ' }),
    ];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, city: 'paris' }).map((e) => e.id),
    ).toEqual(['a', 'c']);
  });

  it('filters by country code', () => {
    const list = [entry('a', { country_code: 'FR' }), entry('b', { country_code: 'US' })];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, countryCode: 'FR' }).map((e) => e.id),
    ).toEqual(['a']);
  });

  it('filters by proof minimum tier', () => {
    const list = [
      { ...entry('a'), proof_level: 'video_ranked' as const },
      { ...entry('b'), proof_level: 'community_verified' as const },
      { ...entry('c'), proof_level: 'judge_verified' as const },
    ];
    expect(
      applyLeaderboardFilters(list, { ...EMPTY_FILTERS, proofMin: 'judge_verified' }).map(
        (e) => e.id,
      ),
    ).toEqual(['c']);
  });
});
