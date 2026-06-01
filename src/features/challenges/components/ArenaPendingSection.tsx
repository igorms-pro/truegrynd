'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenges: Challenge[];
};

export function ArenaPendingSection({ challenges }: Props) {
  const locale = useLocale();
  const t = useTranslations('arena');

  return (
    <div className="rounded-md border border-accent/30 bg-accent/10 p-4 space-y-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
          {t('pendingSectionTitle')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{t('pendingSectionHint')}</p>
      </div>
      <ul className="space-y-2">
        {challenges.map((challenge) => (
          <li key={challenge.id}>
            <Link
              href={`/${locale}/app/arena/${challenge.id}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="truncate text-sm font-black uppercase tracking-tight">
                {challenge.title}
              </span>
              <span className="shrink-0 rounded-sm border border-accent/40 bg-accent/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                {t('pendingBadge')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
