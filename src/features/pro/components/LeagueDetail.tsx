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
    <section className="space-y-5">
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
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('detail.empty')}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
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
                <span className="block truncate text-sm font-bold">{row.gymName}</span>
                <span className="block text-xs text-muted-foreground">
                  {t('detail.members', { count: row.memberCount })}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-lg font-black tabular-nums">{row.avgRating}</span>
                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  {t('detail.avgRating')}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t('detail.note')}</p>
    </section>
  );
}
