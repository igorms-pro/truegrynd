'use client';

import { Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PrimaryButtonLink, SecondaryButtonLink } from '@/components/ButtonLink';
import { getDivisionBadgeClasses } from '@/lib/divisions';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Division, Faction } from '@/lib/types/database.types';

type Props = {
  username: string | null;
  division: Division;
  faction: Faction | null;
  streakDays: number;
  ratingValue: number | null;
  primaryHref: string;
  primaryLabel: string;
  /** Render the CTA as secondary (the comeback banner owns the primary action). */
  primaryAsSecondary: boolean;
};

/** Overview identity hero: name, division/faction badges, streak, rating, and the single CTA. */
export function OverviewHeroCard({
  username,
  division,
  faction,
  streakDays,
  ratingValue,
  primaryHref,
  primaryLabel,
  primaryAsSecondary,
}: Props) {
  const t = useTranslations('overview');
  const tFactions = useTranslations('factions');
  const divisionBadge = getDivisionBadgeClasses(division);
  const factionBadge = faction ? getFactionBadgeClasses(faction) : null;
  const factionName = faction ? tFactions(faction) : null;

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-black uppercase tracking-tight">{username ?? '—'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                divisionBadge.bg,
                divisionBadge.text,
                divisionBadge.border,
              ].join(' ')}
            >
              {division}
            </span>
            {faction && factionBadge && factionName ? (
              <span
                className={[
                  'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                  factionBadge.bg,
                  factionBadge.text,
                  factionBadge.border,
                ].join(' ')}
              >
                {factionName}
              </span>
            ) : null}
          </div>
        </div>
        <div
          className="flex shrink-0 items-center gap-2"
          role="group"
          aria-label={t('streakLine', { days: streakDays })}
        >
          <Flame
            className={
              streakDays > 0
                ? 'h-5 w-5 shrink-0 text-accent'
                : 'h-5 w-5 shrink-0 text-muted-foreground'
            }
            aria-hidden
          />
          <span className="text-lg font-black tabular-nums tracking-tight">
            {t('streakValue', { days: streakDays })}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {t('heroRating')}
          </p>
          <p className="mt-1 text-5xl font-black tabular-nums leading-none tracking-tight">
            {ratingValue !== null ? ratingValue : '—'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{t('heroRatingHint')}</p>
        </div>
      </div>

      <div className="mt-5">
        {primaryAsSecondary ? (
          <SecondaryButtonLink href={primaryHref} label={primaryLabel} />
        ) : (
          <PrimaryButtonLink href={primaryHref} label={primaryLabel} />
        )}
      </div>
    </article>
  );
}
