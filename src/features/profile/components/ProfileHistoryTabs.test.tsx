import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { ProfileHistoryTabs } from '@/features/profile/components/ProfileHistoryTabs';
import en from '@/locales/en.json';

function renderTabs(active: 'all' | 'validated' = 'all', onChange = vi.fn()) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ProfileHistoryTabs active={active} onChange={onChange} disabled={false} />
    </NextIntlClientProvider>,
  );
}

describe('ProfileHistoryTabs', () => {
  it('renders filter tabs with ARIA roles', () => {
    renderTabs();

    expect(screen.getByRole('tablist', { name: /history filters/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /show all history/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /show validated ranked scores/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('calls onChange when a tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTabs('all', onChange);

    await user.click(screen.getByRole('tab', { name: /show validated ranked scores/i }));

    expect(onChange).toHaveBeenCalledWith('validated');
  });
});
