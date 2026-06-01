'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { CLAN_ROW_LINK_CLASS } from '@/features/factions/lib/clanRowLinkClass';
import { formatClanPoints } from '@/features/factions/lib/formatClanPoints';
import type { MemberRow } from '@/features/factions/services/clanHud';
import { publicProfilePath } from '@/features/profile/lib/publicProfilePath';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Faction } from '@/lib/types/database.types';

type Props = {
  members: MemberRow[];
  userFaction: Faction;
  currentUserId: string | null;
};

export function ClanTopMembersCard({ members, userFaction, currentUserId }: Props) {
  const locale = useLocale();
  const t = useTranslations('clan');
  const styles = getFactionBadgeClasses(userFaction);
  const ownProfileHref = `/${locale}/app/profile`;

  return (
    <article
      className={`rounded-md border border-l-4 bg-card p-4 ${styles.accent} ${styles.border}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('topMembersTitle')}
      </p>
      <p className={`mt-1 text-xs font-black uppercase tracking-[0.14em] ${styles.text}`}>
        {t(`faction.${userFaction}`)}
      </p>
      {members.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('emptyMembers')}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {members.map((m, idx) => {
            const isYou = currentUserId !== null && m.userId === currentUserId;
            const href = isYou ? ownProfileHref : publicProfilePath(locale, m.username);
            const rowClass =
              'flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2';
            const linkClass = `${rowClass} ${CLAN_ROW_LINK_CLASS} ${
              isYou ? 'border-primary/40' : 'hover:border-muted-foreground/30'
            }`;

            return (
              <li key={m.userId}>
                <Link
                  href={href}
                  aria-label={
                    isYou
                      ? t('yourProfileLinkAria')
                      : t('memberProfileLinkAria', { username: m.username })
                  }
                  className={linkClass}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black tabular-nums text-muted-foreground">
                      #{idx + 1}
                    </span>
                    <p className="text-sm font-black uppercase tracking-tight">{m.username}</p>
                    {isYou ? (
                      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                        {t('youBadge')}
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black tabular-nums text-foreground">
                      {formatClanPoints(m.points)}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      {t('pointsUnit')}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
