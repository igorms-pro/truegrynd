'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import type { RivalMatchView } from '@/features/rivals/services/rivalMatches';

type Props = {
  match: RivalMatchView;
};

export function RivalMatchSummaryRow({ match }: Props) {
  const t = useTranslations('rivals.list');
  const tStatus = useTranslations('rivals.status');
  const tDivisions = useTranslations('divisions');
  const locale = useLocale();
  const challengeTitles = match.challenges.map((c) => c.title).join(' · ');
  const winnerUsername = match.winnerId
    ? match.participants.find((p) => p.userId === match.winnerId)?.username
    : null;

  return (
    <Link
      href={`/${locale}/app/rivals/${match.id}`}
      className="block rounded-sm border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
    >
      <article>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
              {tStatus(match.status)}
            </p>
            <p className="mt-1 text-sm font-black uppercase tracking-tight">{challengeTitles}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('divisionLine', { division: tDivisions(match.division) })}
            </p>
            {match.status === 'completed' && winnerUsername ? (
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                {t('winnerLine', { username: winnerUsername })}
              </p>
            ) : null}
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {match.durationHours === 24 ? t('duration24') : t('duration7d')}
          </span>
        </div>
      </article>
    </Link>
  );
}
