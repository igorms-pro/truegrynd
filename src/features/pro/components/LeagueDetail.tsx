'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getLeagueStandings, listLeagues } from '@/features/pro/services/leagues';
import { useAsyncResource } from '@/hooks/useAsyncResource';

const RANK_MEDAL = ['#f5c518', '#c0c0c0', '#cd7f32'];

export function LeagueDetail({ leagueId }: { leagueId: string }) {
  const t = useTranslations('pro.leagues');
  const locale = useLocale();
  const loadStandings = useCallback(() => getLeagueStandings(leagueId), [leagueId]);
  const { state } = useAsyncResource(loadStandings, [leagueId]);
  const { state: leaguesState } = useAsyncResource(listLeagues, []);
  const league =
    leaguesState.status === 'ready' ? leaguesState.data.find((l) => l.id === leagueId) : null;

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <Link
        href={`/${locale}/app/pro/leagues`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('detail.back')}
      </Link>

      <header className="space-y-1">
        <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          {league ? t(`scope.${league.scope}`) : '—'}
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
          {league?.name ?? '…'}
        </h1>
        <p className="text-sm text-muted-foreground">{t('detail.intro')}</p>
      </header>

      {state.status === 'loading' || state.status === 'idle' ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold text-primary">{t('error')}</p>
      ) : state.data.length === 0 ? (
        <div className="space-y-4 rounded-md border border-dashed border-border bg-muted/20 p-6 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-foreground">
            {t('detail.emptyTitle')}
          </p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{t('detail.emptyBody')}</p>
          <Link
            href={`/${locale}/app/pro/leagues`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90"
          >
            {t('detail.joinCta')}
          </Link>
        </div>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          <li className="flex items-center gap-3 border-b border-border px-3 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            <span className="w-6 shrink-0 text-center">#</span>
            <span className="min-w-0 flex-1">{t('detail.colGym')}</span>
            <span className="shrink-0 text-right">{t('detail.avgRating')}</span>
          </li>
          {state.data.map((row, i) => (
            <li
              key={row.gymId}
              className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
            >
              <span
                className="w-6 shrink-0 text-center text-base font-black tabular-nums"
                style={{ color: RANK_MEDAL[i] ?? 'inherit' }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <Link
                  href={`/${locale}/app/gym/${row.gymSlug}`}
                  className="block truncate text-sm font-bold hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {row.gymName}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {t('detail.members', { count: row.memberCount })}
                </span>
              </span>
              <span className="shrink-0 text-right text-lg font-black tabular-nums">
                {row.avgRating}
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t('detail.note')}</p>
      <p className="text-[11px] text-muted-foreground">{t('detail.runBy')}</p>
    </section>
  );
}
