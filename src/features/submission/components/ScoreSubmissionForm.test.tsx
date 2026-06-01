import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ScoreSubmissionForm } from '@/features/submission/components/ScoreSubmissionForm';
import en from '@/locales/en.json';
import type { CompleteProfile } from '@/lib/types/database.types';

const submitScoreMock = vi.fn();
const useRequireAppAccessMock = vi.fn();

vi.mock('@/features/submission/services/submitScore', () => ({
  submitScore: (...args: unknown[]) => submitScoreMock(...args),
  SUBMISSION_ERRORS: {
    VIDEO_INVALID: 'video_invalid',
    EXCEEDS_TIME_CAP: 'exceeds_time_cap',
  },
}));

vi.mock('@/features/appshell', () => ({
  useRequireAppAccess: () => useRequireAppAccessMock(),
}));

const profile: CompleteProfile = {
  id: 'user-1',
  username: 'grinder',
  sex: 'male',
  age: 28,
  weight_kg: 80,
  faction: 'horde',
  division: 'rookie',
  city: null,
  country_code: null,
  show_location_on_leaderboard: false,
  show_division_on_public: true,
  show_rating_on_public: true,
  show_score_history_on_public: true,
  show_top_scores_on_public: true,
  show_badges_on_public: true,
  show_weeklies_on_public: true,
  show_finishers_on_public: true,
  initiation_completed: true,
  creator_score: 0,
  streak_days: 0,
  last_activity_at: null,
  avatar_url: null,
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function renderForm(onSubmitted = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ScoreSubmissionForm
        challengeId="challenge-1"
        scoreType="reps"
        availableVariants={['standard']}
        onSubmitted={onSubmitted}
      />
    </NextIntlClientProvider>,
  );
}

describe('ScoreSubmissionForm', () => {
  beforeEach(() => {
    submitScoreMock.mockReset();
    useRequireAppAccessMock.mockReturnValue({ status: 'ready', profile });
    submitScoreMock.mockResolvedValue({ insertedId: 'score-1', ranked: false });
  });

  it('defaults reps to 0 and does not insert until submit', async () => {
    const user = userEvent.setup();
    renderForm();

    const repsInput = screen.getByPlaceholderText('0');
    expect(repsInput).toHaveValue(0);
    expect(submitScoreMock).not.toHaveBeenCalled();

    await user.clear(repsInput);
    await user.type(repsInput, '42');
    await user.click(screen.getByRole('button', { name: /submit your score/i }));

    await waitFor(() => {
      expect(submitScoreMock).toHaveBeenCalledTimes(1);
    });
    expect(submitScoreMock).toHaveBeenCalledWith({
      challengeId: 'challenge-1',
      userId: 'user-1',
      value: 42,
      variant: 'standard',
      videoUrl: '',
    });
  });
});
