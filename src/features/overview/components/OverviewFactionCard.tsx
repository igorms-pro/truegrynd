'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { FactionStandingsBar } from '@/features/factions/components/FactionStandingsBar';
import { useClanHud } from '@/features/factions/hooks/useClanHud';
import type { Faction } from '@/lib/types/database.types';

/** Tappable Overview card: your faction's rank, points, gap, standings bars and contribution. */
export function OverviewFactionCard({ href, userFaction }: { href: string; userFaction: Faction }) {
  const t = useTranslations('overview');
  const tFactions = useTranslations('factions');
  const { state } = useClanHud();

  const rankings =
    state.status === 'ready' ? [...state.rankings].sort((a, b) => b.points - a.points) : [];
  const myIndex = rankings.findIndex((r) => r.faction === userFaction);
  const myRow = myIndex >= 0 ? rankings[myIndex] : null;
  const rank = myIndex >= 0 ? myIndex + 1 : null;
  const leaderPoints = rankings[0]?.points ?? 0;
  const gapText =
    myRow && rank
      ? rank === 1
        ? t('factionLeadingBy', { gap: myRow.points - (rankings[1]?.points ?? 0) })
        : t('factionGapToFirst', { gap: leaderPoints - myRow.points })
      : null;

  return (
    <Link
      href={href}
      aria-label={t('viewFactionAria')}
      className="group block rounded-lg border border-border bg-card p-5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('factionStandingTitle')}
        </p>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>

      {state.status === 'loading' ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
      ) : null}

      {state.status === 'error' ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('error')}</p>
      ) : null}

      {state.status === 'ready' && myRow && rank ? (
        <div className="mt-3 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('factionRankLabel')}
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums leading-none">#{rank}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('factionPointsLabel')}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums leading-none text-accent">
                {myRow.points.toLocaleString()}
              </p>
            </div>
          </div>

          {gapText ? (
            <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">{gapText}</p>
          ) : null}

          <FactionStandingsBar
            rankings={state.rankings}
            myFaction={userFaction}
            getLabel={(f) => tFactions(f)}
          />

          <p className="text-xs text-muted-foreground">
            {t('factionYourShare', { points: state.myContribution.toLocaleString() })}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
