'use client';

import { Gavel, Plus } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AtRiskPanel } from '@/features/pro/components/AtRiskPanel';
import { fetchGymOverview } from '@/features/pro/services/dashboard';
import { useAsyncResource } from '@/hooks/useAsyncResource';

/** PRO home = signal (what needs attention), not a mirror of the sidebar nav. */
export function ProDashboard() {
  const t = useTranslations('pro');
  const tKpi = useTranslations('pro.dashboard.kpi');
  const tKpiHint = useTranslations('pro.dashboard.kpiHint');
  const tEvents = useTranslations('pro.events');
  const tNav = useTranslations('pro.nav');
  const locale = useLocale();
  const { state } = useAsyncResource(fetchGymOverview, []);
  const data = state.status === 'ready' ? state.data : null;

  const pending = data?.pendingCount ?? 0;
  const needsReview = pending > 0;
  const cards: ReadonlyArray<{ key: string; value: number | null }> = [
    { key: 'members', value: data?.memberCount ?? null },
    { key: 'pending', value: data?.pendingCount ?? null },
    { key: 'active7d', value: data?.active7dCount ?? null },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.intro')}</p>
      </header>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {cards.map((c) => {
          const highlight = c.key === 'pending' && needsReview;
          return (
            <li
              key={c.key}
              className={`rounded-md border p-4 ${
                highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <p className={`text-3xl font-black tabular-nums ${highlight ? 'text-primary' : ''}`}>
                {state.status === 'error' ? '—' : (c.value ?? '·')}
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {tKpi(c.key)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{tKpiHint(c.key)}</p>
              {highlight ? (
                <Link
                  href={`/${locale}/app/pro/judge`}
                  className="mt-2 inline-block text-xs font-black uppercase tracking-[0.12em] text-primary hover:underline"
                >
                  {t('dashboard.pendingCta')} →
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>

      <AtRiskPanel />

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('dashboard.quickTitle')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${locale}/app/pro/events/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {tEvents('create.cta')}
          </Link>
          <Link
            href={`/${locale}/app/pro/judge`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:bg-muted"
          >
            <Gavel className="h-4 w-4" />
            {tNav('judge')}
            {data?.pendingCount ? ` (${data.pendingCount})` : ''}
          </Link>
        </div>
      </div>
    </div>
  );
}
