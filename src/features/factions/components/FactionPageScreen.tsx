'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { ClanFactionWarMeta } from '@/features/factions/components/ClanFactionWarMeta';
import { FactionHallOfFame } from '@/features/factions/components/FactionHallOfFame';
import { FactionRecentProof } from '@/features/factions/components/FactionRecentProof';
import { RecruitCta } from '@/features/factions/components/RecruitCta';
import { useFactionPage } from '@/features/factions/hooks/useFactionPage';
import { formatClanPoints } from '@/features/factions/lib/formatClanPoints';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { getFactionBadgeClasses } from '@/lib/factionStyles';

type Props = {
  slug: string;
};

export function FactionPageScreen({ slug }: Props) {
  const locale = useLocale();
  const t = useTranslations('factionPage');
  const tClan = useTranslations('clan.faction');
  const { state, refetch } = useFactionPage(slug);
  const appProfile = useOptionalAppProfile();

  const clanHref = `/${locale}/app/clan`;
  const arenaHref = `/${locale}/app/arena`;
  const currentUserId = appProfile?.id ?? null;
  const userFaction = appProfile?.faction ?? null;

  if (state.status === 'invalid') {
    return (
      <section className="space-y-4">
        <Link
          href={clanHref}
          className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('backToClan')}
        </Link>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('invalidTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('invalidBody')}</p>
        </div>
      </section>
    );
  }

  if (state.status === 'loading') {
    return (
      <section className="space-y-4">
        <p role="status" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
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

  const { faction, rankings, members, war, myContribution } = state;
  const styles = getFactionBadgeClasses(faction);
  const sortedRankings = [...rankings].sort((a, b) => b.points - a.points);
  const rankIndex = sortedRankings.findIndex((r) => r.faction === faction);
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;
  const row = sortedRankings.find((r) => r.faction === faction);
  const isOwnFaction = userFaction === faction;
  const maxPoints = Math.max(1, sortedRankings[0]?.points ?? 0);
  const myPoints = row?.points ?? 0;
  const gapText =
    rank === 1
      ? t('leadingBy', { gap: formatClanPoints(myPoints - (sortedRankings[1]?.points ?? 0)) })
      : t('gapToFirst', { gap: formatClanPoints((sortedRankings[0]?.points ?? 0) - myPoints) });
  const contributionPct = myPoints > 0 ? Math.round((myContribution / myPoints) * 100) : 0;

  return (
    <section className="space-y-6 pb-24">
      <header className="space-y-3">
        <Link
          href={clanHref}
          aria-label={t('backToClanAria')}
          className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t('backToClan')}
        </Link>
        <div
          className={`rounded-md border border-l-4 bg-card p-4 ${styles.accent} ${styles.border}`}
        >
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('headerKicker')}
          </p>
          <h1 className={`mt-2 text-2xl font-black uppercase tracking-tight ${styles.text}`}>
            {tClan(faction)}
          </h1>
          {isOwnFaction ? (
            <span
              className={`mt-2 inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${styles.bg} ${styles.text} ${styles.border}`}
            >
              {t('yourFactionBadge')}
            </span>
          ) : null}
        </div>
      </header>

      <article className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('warStatsTitle')}
        </p>
        <ClanFactionWarMeta war={war} myContribution={myContribution} />
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {t('statRank')}
            </dt>
            <dd className="mt-1 text-lg font-black tabular-nums">
              {rank !== null ? `#${rank}` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {t('statPoints')}
            </dt>
            <dd className={`mt-1 text-lg font-black tabular-nums ${styles.text}`}>
              {formatClanPoints(row?.points ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {t('statFighters')}
            </dt>
            <dd className="mt-1 text-lg font-black tabular-nums">{row?.members ?? 0}</dd>
          </div>
        </dl>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('standingsTitle')}
          </p>
          <div className="space-y-2">
            {sortedRankings.map((r) => {
              const mine = r.faction === faction;
              return (
                <div key={r.faction} className="flex items-center gap-2">
                  <span
                    className={[
                      'w-28 shrink-0 truncate text-[10px] font-black uppercase tracking-[0.14em]',
                      mine ? 'text-foreground' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {tClan(r.faction)}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={
                        mine ? 'block h-full bg-accent' : 'block h-full bg-muted-foreground/40'
                      }
                      style={{ width: `${Math.round((r.points / maxPoints) * 100)}%` }}
                    />
                  </span>
                  <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                    {formatClanPoints(r.points)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">{gapText}</p>
        </div>
      </article>

      {isOwnFaction ? (
        <article className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('impactTitle')}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                {t('yourContribution')}
              </p>
              <p className={`mt-1 text-3xl font-black tabular-nums ${styles.text}`}>
                {formatClanPoints(myContribution)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('contributionShare', { pct: contributionPct })}
            </p>
          </div>
          <span className="mt-3 block h-2 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full bg-accent"
              style={{ width: `${Math.min(100, contributionPct)}%` }}
            />
          </span>
        </article>
      ) : null}

      <FactionHallOfFame faction={faction} members={members} currentUserId={currentUserId} />

      <FactionRecentProof faction={faction} />

      {isOwnFaction ? (
        <RecruitCta
          faction={faction}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truegrynd.app'}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 p-4 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Link
          href={arenaHref}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('ctaArena')}
        </Link>
      </div>
    </section>
  );
}
