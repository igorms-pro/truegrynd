import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { FinisherGallery } from '@/features/profile/components/FinisherGallery';
import en from '@/locales/en.json';

const useMyScoresMock = vi.fn();

vi.mock('@/features/profile/hooks/useMyScores', () => ({
  useMyScores: (...args: unknown[]) => useMyScoresMock(...args),
}));

function renderGallery() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <FinisherGallery userId="user-1" username="grinder" faction="horde" />
    </NextIntlClientProvider>,
  );
}

describe('FinisherGallery', () => {
  it('shows retry button on error and calls refetch', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    useMyScoresMock.mockReturnValue({
      state: { status: 'error', data: null, error: 'network' },
      refetch,
    });

    renderGallery();

    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
