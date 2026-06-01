'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { HistoryItemRow } from '@/features/profile/components/HistoryItemRow';
import { ProfileHistoryTabs } from '@/features/profile/components/ProfileHistoryTabs';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileHistory } from '@/features/profile/hooks/useProfileHistory';
import { filterHistoryByChallenge } from '@/features/profile/lib/filterHistoryByChallenge';
import type { HistoryTab } from '@/features/profile/types';

function emptyCopyKey(tab: HistoryTab): string {
  return `empty.${tab}`;
}

export function ProfileHistoryScreen() {
  const locale = useLocale();
  const t = useTranslations('profile.historyPage');
  const searchParams = useSearchParams();
  const challengeFilter = searchParams.get('challenge');
  const { state: profileState } = useProfile();
  const userId = profileState.status === 'ready' ? profileState.profile.id : null;
  const { state, activeTab, setActiveTab, filteredItems, refetch } = useProfileHistory(userId);

  const profileHref = `/${locale}/app/profile`;
  const displayItems = useMemo(
    () => filterHistoryByChallenge(filteredItems, challengeFilter),
    [challengeFilter, filteredItems],
  );

  if (profileState.status === 'loading' || state.status === 'loading') {
    return (
      <section className="space-y-4">
        <Link
          href={profileHref}
          className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('back')}
        </Link>
        <p role="status" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (profileState.status === 'error' || state.status === 'error') {
    const errorMessage =
      profileState.status === 'error'
        ? profileState.error
        : state.status === 'error'
          ? state.error
          : '';

    return (
      <section className="space-y-4">
        <Link
          href={profileHref}
          className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('back')}
        </Link>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          {errorMessage ? (
            <p className="mt-2 text-xs text-muted-foreground">{errorMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={refetch}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    );
  }

  const emptyKey = emptyCopyKey(activeTab);

  return (
    <section className="space-y-4">
      <Link
        href={profileHref}
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('backAria')}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>

      {challengeFilter ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
          {t('challengeFilterBanner')}
        </p>
      ) : null}

      <ProfileHistoryTabs active={activeTab} onChange={setActiveTab} disabled={false} />

      {displayItems.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{t(emptyKey)}</p>
        </div>
      ) : (
        <div className="space-y-2" role="tabpanel">
          {displayItems.map((item) => (
            <HistoryItemRow
              key={item.kind === 'score' ? item.id : `progress-${item.challengeId}`}
              item={item}
              userId={userId}
              onScoreChanged={refetch}
            />
          ))}
        </div>
      )}
    </section>
  );
}
