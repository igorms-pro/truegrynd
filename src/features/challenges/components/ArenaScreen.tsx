'use client';

import { useTranslations } from 'next-intl';

import { ChallengeList } from '@/features/challenges/components/ChallengeList';
import { useChallenges } from '@/features/challenges/hooks/useChallenges';

function ArenaHeader() {
  const t = useTranslations('arena');
  return (
    <header className="space-y-1">
      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
    </header>
  );
}

function ArenaLoading() {
  const t = useTranslations('arena');
  return (
    <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
      {t('loading')}
    </p>
  );
}

function ArenaEmpty() {
  const t = useTranslations('arena');
  return (
    <div className="rounded-md border border-border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground">{t('empty')}</p>
    </div>
  );
}

function ArenaError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('arena');
  return (
    <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
        {t('errorTitle')}
      </p>
      <p className="mt-1 text-sm text-foreground/80">{t('errorBody')}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('retry')}
      </button>
    </div>
  );
}

export function ArenaScreen() {
  const { data, loading, error, refetch } = useChallenges();

  return (
    <section className="space-y-5">
      <ArenaHeader />

      {loading ? <ArenaLoading /> : null}

      {!loading && error ? <ArenaError onRetry={() => void refetch()} /> : null}

      {!loading && !error && data.length === 0 ? <ArenaEmpty /> : null}

      {!loading && !error && data.length > 0 ? <ChallengeList challenges={data} /> : null}
    </section>
  );
}
