'use client';

import { useTranslations } from 'next-intl';

import { RecruitCta } from '@/features/factions/components/RecruitCta';
import { useClanHud } from '@/features/factions/hooks/useClanHud';

function formatPoints(points: number): string {
  if (!Number.isFinite(points)) return '0';
  return Math.round(points).toLocaleString();
}

export function ClanScreen() {
  const tabs = useTranslations('app.tabs');
  const t = useTranslations('clan');

  const { state, refetch } = useClanHud();

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{tabs('clan')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      {state.status === 'loading' ? (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
      ) : null}

      {state.status === 'ready' && state.faction ? (
        <RecruitCta
          faction={state.faction}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truegrynd.app'}
        />
      ) : null}

      {state.status === 'ready' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-md border border-border bg-card p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('factionsTitle')}
            </p>
            <ul className="mt-3 space-y-2">
              {state.rankings.map((row, idx) => (
                <li
                  key={row.faction}
                  className={`flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 ${
                    row.faction === state.faction ? 'border-primary/60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black tabular-nums text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.18em]">
                        {t(`faction.${row.faction}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('members', { count: row.members })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black tabular-nums text-foreground">
                    {formatPoints(row.points)}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-md border border-border bg-card p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('topMembersTitle')}
            </p>
            {state.members.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t('emptyMembers')}</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {state.members.map((m, idx) => (
                  <li
                    key={m.userId}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black tabular-nums text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <p className="text-sm font-black uppercase tracking-tight">{m.username}</p>
                    </div>
                    <p className="text-sm font-black tabular-nums text-foreground">
                      {formatPoints(m.points)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>
      ) : null}
    </section>
  );
}
