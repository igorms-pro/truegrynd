'use client';

import { useTranslations } from 'next-intl';

import type { RivalMatchView } from '@/features/rivals/services/rivalMatches';

type Props = {
  match: RivalMatchView;
  currentUserId: string | null;
  detailReason: 'decided' | 'tie' | 'incomplete' | null;
};

export function RivalMatchResultBanner({ match, currentUserId, detailReason }: Props) {
  const t = useTranslations('rivals.detail');
  const winnerUsername = match.winnerId
    ? (match.participants.find((p) => p.userId === match.winnerId)?.username ?? t('unknown'))
    : null;

  if (match.status === 'expired') {
    return (
      <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        {t('expiredHint')}
      </p>
    );
  }

  if (match.status === 'cancelled') {
    return (
      <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        {t('cancelledHint')}
      </p>
    );
  }

  if (match.status !== 'completed') return null;

  if (match.winnerId && match.winnerId === currentUserId) {
    return (
      <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-black uppercase tracking-tight text-accent">
        {t('youWon')}
      </p>
    );
  }

  if (match.winnerId) {
    return (
      <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-black uppercase tracking-tight text-accent">
        {t('winner', { username: winnerUsername ?? t('unknown') })}
      </p>
    );
  }

  if (detailReason === 'tie') {
    return (
      <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        {t('tieFinal')}
      </p>
    );
  }

  return (
    <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
      {t('noWinnerFinal')}
    </p>
  );
}
