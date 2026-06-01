'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { RivalMatchSummaryRow } from '@/features/rivals/components/RivalMatchSummaryRow';
import { RivalPendingInviteCard } from '@/features/rivals/components/RivalPendingInviteCard';
import { useMyRivalMatches } from '@/features/rivals/hooks/useMyRivalMatches';
import { useProfile } from '@/features/profile/hooks/useProfile';

export function RivalMatchesScreen() {
  const t = useTranslations('rivals.hub');
  const locale = useLocale();
  const profileState = useProfile();
  const userId = profileState.state.status === 'ready' ? profileState.state.profile.id : null;
  const { state, pendingInvites, refetch, respond, respondingId } = useMyRivalMatches(userId);

  if (profileState.state.status === 'loading' || state.status === 'loading') {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground" role="status">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (profileState.state.status === 'error' || state.status === 'error') {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    );
  }

  const matches = state.matches ?? [];
  const otherMatches = matches.filter(
    (match) => !pendingInvites.some((pending) => pending.id === match.id),
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Link
          href={`/${locale}/app/rivals/new`}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
        >
          {t('newCta')}
        </Link>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('invitesTitle')}
        </h2>
        {pendingInvites.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('invitesEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {pendingInvites.map((match) => (
              <li key={match.id}>
                <RivalPendingInviteCard
                  match={match}
                  disabled={respondingId === match.id}
                  onAccept={() => void respond(match.id, true)}
                  onDecline={() => void respond(match.id, false)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('matchesTitle')}
        </h2>
        {otherMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('matchesEmpty')}</p>
        ) : (
          <ul className="space-y-2">
            {otherMatches.map((match) => (
              <li key={match.id}>
                <RivalMatchSummaryRow match={match} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
