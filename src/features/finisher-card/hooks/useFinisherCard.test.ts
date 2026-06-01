import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { useFinisherCard } from '@/features/finisher-card/hooks/useFinisherCard';

const getScoreByIdMock = vi.fn();
const getChallengeByIdMock = vi.fn();
const getRankCountsMock = vi.fn();
const useRequireAppAccessMock = vi.fn();

vi.mock('@/features/finisher-card/services/scores', () => ({
  getScoreById: (...args: unknown[]) => getScoreByIdMock(...args),
}));

vi.mock('@/lib/challenges', () => ({
  getChallengeById: (...args: unknown[]) => getChallengeByIdMock(...args),
}));

vi.mock('@/lib/rank', () => ({
  getRankCounts: (...args: unknown[]) => getRankCountsMock(...args),
  formatTopPercent: (p: number) => Math.max(1, Math.ceil((1 - p) * 100)),
  percentileFromCounts: (total: number, better: number) =>
    total > 0 ? { rank: better + 1, total, percentile: 1 - better / total } : null,
}));

vi.mock('@/features/appshell', () => ({
  useRequireAppAccess: () => useRequireAppAccessMock(),
}));

const profile = {
  id: 'user-1',
  username: 'grinder',
  sex: 'male' as const,
  age: 28,
  weight_kg: 80,
  faction: 'horde' as const,
  division: 'regular' as const,
  initiation_completed: true,
  creator_score: 0,
  streak_days: 0,
  last_activity_at: null,
  avatar_url: null,
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const score = {
  id: 'score-1',
  challenge_id: 'challenge-1',
  user_id: 'user-1',
  value: 42,
  video_url: 'https://youtube.com/watch?v=abc',
  is_validated: true,
  submitted_at: '2026-06-01T00:00:00Z',
};

const challenge = {
  id: 'challenge-1',
  title: 'Burpee Blitz',
  description: '',
  rules: '',
  score_type: 'reps' as const,
  equipment_tags: [],
  is_official: true,
  status: 'approved' as const,
  creator_id: null,
  created_at: '2026-06-01T00:00:00Z',
};

describe('useFinisherCard', () => {
  beforeEach(() => {
    getScoreByIdMock.mockReset();
    getChallengeByIdMock.mockReset();
    getRankCountsMock.mockReset();
    useRequireAppAccessMock.mockReturnValue({ status: 'ready', profile });
    getScoreByIdMock.mockResolvedValue(score);
    getChallengeByIdMock.mockResolvedValue(challenge);
    getRankCountsMock.mockResolvedValue({ total: 10, better: 2 });
  });

  it('loads card when rank fetch fails (degrades without top percent)', async () => {
    getRankCountsMock.mockRejectedValue(new Error('rank_down'));

    const { result } = renderHook(() =>
      useFinisherCard({
        challengeId: 'challenge-1',
        scoreId: 'score-1',
        ranked: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current).toMatchObject({
      status: 'ready',
      topPercent: null,
      username: 'grinder',
    });
  });

  it('returns error when score does not belong to the current user', async () => {
    getScoreByIdMock.mockResolvedValue({ ...score, user_id: 'other-user' });

    const { result } = renderHook(() =>
      useFinisherCard({
        challengeId: 'challenge-1',
        scoreId: 'score-1',
        ranked: false,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });
});
