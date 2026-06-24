'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { joinLeague, leaveLeague, listLeagues, type League } from '@/features/pro/services/leagues';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { isGymManager } from '@/lib/roles';

function LeagueRow({
  league,
  canManage,
  onChanged,
}: {
  league: League;
  canManage: boolean;
  onChanged: () => void;
}) {
  const t = useTranslations('pro.leagues');
  const locale = useLocale();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (league.isMember) await leaveLeague(league.id);
      else await joinLeague(league.id);
      onChanged();
    } catch {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0">
      <Link
        href={`/${locale}/app/pro/leagues/${league.id}`}
        className="min-w-0 flex-1 hover:opacity-80"
      >
        <span className="block truncate text-sm font-bold">{league.name}</span>
        <span className="text-xs text-muted-foreground">
          {t('members', { count: league.memberCount })}
        </span>
      </Link>
      <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        {t(`scope.${league.scope}`)}
      </span>
      {canManage ? (
        <button
          type="button"
          disabled={busy}
          onClick={toggle}
          className={`shrink-0 rounded-md px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] disabled:opacity-50 ${
            league.isMember
              ? 'border border-border text-muted-foreground hover:text-foreground'
              : 'bg-primary text-primary-foreground hover:opacity-90'
          }`}
        >
          {league.isMember ? t('leave') : t('join')}
        </button>
      ) : league.isMember ? (
        <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
          {t('joined')}
        </span>
      ) : null}
    </li>
  );
}

export function LeaguesList() {
  const t = useTranslations('pro.leagues');
  const profile = useOptionalAppProfile();
  const canManage = isGymManager(profile);
  const { state, refetch } = useAsyncResource(listLeagues, []);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>
      {state.data.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          {state.data.map((l) => (
            <LeagueRow key={l.id} league={l} canManage={canManage} onChanged={refetch} />
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{t('standingsSoon')}</p>
    </div>
  );
}
