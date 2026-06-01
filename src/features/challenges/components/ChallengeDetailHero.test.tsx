import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { ChallengeDetailHero } from '@/features/challenges/components/ChallengeDetailHero';
import en from '@/locales/en.json';
import type { Challenge } from '@/lib/types/database.types';

const submitScoreMock = vi.fn();

vi.mock('@/features/submission/services/submitScore', () => ({
  submitScore: (...args: unknown[]) => submitScoreMock(...args),
  SUBMISSION_ERRORS: {},
}));

const approvedChallenge: Challenge = {
  id: 'challenge-1',
  title: 'Burpee Blitz',
  description: 'Max reps in 5 minutes.',
  rules: 'Full extension each rep.',
  score_type: 'reps',
  equipment_tags: [],
  is_official: true,
  status: 'approved',
  creator_id: null,
  created_at: '2026-06-01T00:00:00Z',
};

function renderHero(challenge: Challenge = approvedChallenge) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ChallengeDetailHero challenge={challenge} locale="en" isApproved participation={null} />
    </NextIntlClientProvider>,
  );
}

describe('ChallengeDetailHero', () => {
  it('renders a navigation link to the submit form without calling submitScore', async () => {
    const user = userEvent.setup();
    renderHero();

    const cta = screen.getByRole('link', { name: /post score/i });
    expect(cta).toHaveAttribute('href', '/en/app/arena/challenge-1/submit');
    expect(screen.getByText(/nothing is saved until you submit/i)).toBeInTheDocument();

    await user.click(cta);

    expect(submitScoreMock).not.toHaveBeenCalled();
  });

  it('shows retry CTA and history link when user already submitted', () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ChallengeDetailHero
          challenge={approvedChallenge}
          locale="en"
          isApproved
          participation={{ attemptCount: 2, bestValue: 42, bestIsValidated: true }}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('link', { name: /re-try/i })).toHaveAttribute(
      'href',
      '/en/app/arena/challenge-1/submit',
    );
    expect(screen.getByRole('link', { name: /view my attempts/i })).toHaveAttribute(
      'href',
      '/en/app/profile/history?challenge=challenge-1',
    );
  });
});
