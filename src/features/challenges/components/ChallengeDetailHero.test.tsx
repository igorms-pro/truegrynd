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
      <ChallengeDetailHero challenge={challenge} locale="en" isApproved />
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
});
