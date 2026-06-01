import { describe, expect, it } from 'vitest';

import {
  buildHistoryItems,
  filterHistoryByTab,
  isWonScore,
} from '@/features/profile/lib/filterHistoryByTab';
import type { HistoryItem, HistoryScoreItem } from '@/features/profile/types';

const rankedOfficial: HistoryScoreItem = {
  kind: 'score',
  id: 's1',
  challengeId: 'c1',
  challengeTitle: 'Burpees',
  scoreType: 'time',
  value: 430,
  isValidated: true,
  proofLevel: 'video_ranked',
  isHidden: false,
  videoUrl: 'https://www.youtube.com/watch?v=abc',
  isOfficial: true,
  topPercent: null,
  submittedAt: '2026-06-01T10:00:00Z',
};

const rankedElite: HistoryScoreItem = {
  kind: 'score',
  id: 's2',
  challengeId: 'c2',
  challengeTitle: 'Sandbag',
  scoreType: 'reps',
  value: 50,
  isValidated: true,
  proofLevel: 'community_verified',
  isHidden: false,
  videoUrl: null,
  isOfficial: false,
  topPercent: 8,
  submittedAt: '2026-05-30T10:00:00Z',
};

const savedScore: HistoryScoreItem = {
  kind: 'score',
  id: 's3',
  challengeId: 'c3',
  challengeTitle: 'Push-ups',
  scoreType: 'reps',
  value: 40,
  isValidated: false,
  proofLevel: 'honor',
  isHidden: false,
  videoUrl: null,
  isOfficial: false,
  topPercent: null,
  submittedAt: '2026-05-28T10:00:00Z',
};

const inProgress: Extract<HistoryItem, { kind: 'in_progress' }> = {
  kind: 'in_progress',
  challengeId: 'c4',
  challengeTitle: 'Plank',
  committedAt: '2026-06-02T10:00:00Z',
};

const allItems = buildHistoryItems([rankedOfficial, rankedElite, savedScore], [inProgress]);

describe('isWonScore', () => {
  it('marks official validated scores as won', () => {
    expect(isWonScore(rankedOfficial)).toBe(true);
  });

  it('marks top 10% validated scores as won', () => {
    expect(isWonScore(rankedElite)).toBe(true);
  });

  it('rejects saved and non-elite validated scores', () => {
    expect(isWonScore(savedScore)).toBe(false);
    expect(
      isWonScore({
        ...rankedElite,
        topPercent: 15,
        isOfficial: false,
      }),
    ).toBe(false);
  });
});

describe('filterHistoryByTab', () => {
  it('returns all items for the all tab', () => {
    expect(filterHistoryByTab(allItems, 'all')).toHaveLength(4);
  });

  it('filters in-progress commitments only', () => {
    expect(filterHistoryByTab(allItems, 'in_progress')).toEqual([inProgress]);
  });

  it('filters validated ranked scores', () => {
    const result = filterHistoryByTab(allItems, 'validated');
    expect(result).toHaveLength(2);
    expect(result.every((item) => item.kind === 'score' && item.isValidated)).toBe(true);
  });

  it('filters saved honor scores', () => {
    expect(filterHistoryByTab(allItems, 'saved')).toEqual([savedScore]);
  });

  it('filters won highlights', () => {
    const result = filterHistoryByTab(allItems, 'won');
    expect(result).toHaveLength(2);
    expect(result.map((item) => (item.kind === 'score' ? item.id : null))).toEqual(['s1', 's2']);
  });
});

describe('buildHistoryItems', () => {
  it('sorts by most recent activity first', () => {
    expect(allItems[0]).toEqual(inProgress);
    expect(allItems[1]).toEqual(rankedOfficial);
  });
});
