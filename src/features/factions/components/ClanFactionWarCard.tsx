'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { CLAN_ROW_LINK_CLASS } from '@/features/factions/lib/clanRowLinkClass';
import { factionPath } from '@/features/factions/lib/factionSlug';
import { formatClanPoints } from '@/features/factions/lib/formatClanPoints';
import type { FactionRow } from '@/features/factions/services/clanHud';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Faction } from '@/lib/types/database.types';

type Props = {
  rankings: FactionRow[];
  userFaction: Faction;
};

export function ClanFactionWarCard({ rankings, userFaction }: Props) {
  const locale = useLocale();
  const t = useTranslations('clan');

  return (
    <article className="rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('factionsTitle')}
      </p>
      <ul className="mt-3 space-y-2">
        {rankings.map((row, idx) => {
          const isYours = row.faction === userFaction;
          const styles = getFactionBadgeClasses(row.faction);
          const rowClass = `flex items-center justify-between gap-3 rounded-md border border-l-4 bg-background px-3 py-2 ${styles.accent} ${
            isYours ? `${styles.bg} ${styles.border} border-primary/40` : 'border-border'
          }`;

          const rowInner = (
            <>
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-xs font-black tabular-nums text-muted-foreground">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-sm font-black uppercase tracking-[0.18em] ${styles.text}`}>
                      {t(`faction.${row.faction}`)}
                    </p>
                    {isYours ? (
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${styles.bg} ${styles.text} ${styles.border}`}
                      >
                        {t('yourFactionBadge')}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('activeFighters', { count: row.members })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-sm font-black tabular-nums ${styles.text}`}>
                  {formatClanPoints(row.points)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                  {t('pointsUnit')}
                </p>
              </div>
            </>
          );

          return (
            <li key={row.faction}>
              <Link
                href={factionPath(locale, row.faction)}
                aria-label={t('factionPageLinkAria', { faction: t(`faction.${row.faction}`) })}
                className={`${rowClass} ${CLAN_ROW_LINK_CLASS}`}
              >
                {rowInner}
              </Link>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
