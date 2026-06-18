import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { ComebackWeekBanner } from '@/features/growth/components/ComebackWeekBanner';
import fr from '@/locales/fr.json';

function renderBanner(props: {
  weeksAway: number;
  weeklyChallengeId: string | null;
  hasComebackEvent?: boolean;
}) {
  return render(
    <NextIntlClientProvider locale="fr" messages={fr}>
      <ComebackWeekBanner hasComebackEvent={false} {...props} />
    </NextIntlClientProvider>,
  );
}

describe('ComebackWeekBanner', () => {
  it('pluralizes weeks via ICU (no literal "(s)")', () => {
    const { rerender } = renderBanner({ weeksAway: 1, weeklyChallengeId: null });
    expect(screen.getByText(/1 semaine\b/)).toBeInTheDocument();
    expect(screen.queryByText(/semaine\(s\)/)).not.toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="fr" messages={fr}>
        <ComebackWeekBanner weeksAway={2} weeklyChallengeId={null} hasComebackEvent={false} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText(/2 semaines/)).toBeInTheDocument();
  });

  it('deep-links the CTA to the weekly submit form when a weekly exists', () => {
    renderBanner({ weeksAway: 2, weeklyChallengeId: 'chal-123' });
    const link = screen.getByRole('link', { name: /poster un score/i });
    expect(link).toHaveAttribute('href', '/fr/app/arena/chal-123/submit');
  });

  it('falls back to the Arena with an honest label when there is no weekly', () => {
    renderBanner({ weeksAway: 2, weeklyChallengeId: null });
    const link = screen.getByRole('link', { name: /ouvrir l’arène/i });
    expect(link).toHaveAttribute('href', '/fr/app/arena');
  });
});
