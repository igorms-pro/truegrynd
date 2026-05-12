'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { ChallengeList } from '@/features/challenges/components/ChallengeList';
import { useChallenges } from '@/features/challenges/hooks/useChallenges';
import { rankChallenges, type ArenaTab } from '@/features/challenges/lib/arenaRanking';

function ArenaHeader() {
  const t = useTranslations('arena');
  const locale = useLocale();
  const createHref = `/${locale}/app/arena/create`;
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>
      <Link
        href={createHref}
        className="hidden min-h-11 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
      >
        {t('create.cta')}
      </Link>
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

type TabButtonProps = {
  tab: ArenaTab;
  active: boolean;
  label: string;
  onSelect: (tab: ArenaTab) => void;
};

function TabButton({ tab, active, label, onSelect }: TabButtonProps) {
  const className = [
    'rounded-sm border px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
    active
      ? 'border-primary bg-primary/15 text-primary'
      : 'border-border bg-background text-muted-foreground hover:text-foreground',
  ].join(' ');

  return (
    <button type="button" className={className} onClick={() => onSelect(tab)}>
      {label}
    </button>
  );
}

function ArenaTabs({
  activeTab,
  onChange,
}: {
  activeTab: ArenaTab;
  onChange: (tab: ArenaTab) => void;
}) {
  const t = useTranslations('arena.tabs');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TabButton
        tab="trending"
        active={activeTab === 'trending'}
        label={t('trending')}
        onSelect={onChange}
      />
      <TabButton tab="new" active={activeTab === 'new'} label={t('new')} onSelect={onChange} />
    </div>
  );
}

export function ArenaScreen() {
  const t = useTranslations('arena');
  const locale = useLocale();
  const createHref = `/${locale}/app/arena/create`;
  const { data, loading, error, refetch } = useChallenges();
  const [tab, setTab] = useState<ArenaTab>('trending');

  const ranked = useMemo(() => rankChallenges(data, tab), [data, tab]);

  return (
    <section className="relative space-y-5 pb-24 md:pb-5">
      <ArenaHeader />
      <ArenaTabs activeTab={tab} onChange={setTab} />

      {loading ? <ArenaLoading /> : null}

      {!loading && error ? <ArenaError onRetry={() => void refetch()} /> : null}

      {!loading && !error && data.length === 0 ? <ArenaEmpty /> : null}

      {!loading && !error && ranked.length > 0 ? <ChallengeList challenges={ranked} /> : null}

      <Link
        href={createHref}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground shadow-[0_12px_28px_rgba(0,0,0,0.35)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        aria-label={t('create.fab')}
      >
        <Plus className="h-7 w-7" strokeWidth={2.4} aria-hidden />
      </Link>
    </section>
  );
}
