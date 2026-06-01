'use client';

import { useTranslations } from 'next-intl';

import type { EventRecapRow } from '@/features/events/services/events';
import type { Division } from '@/lib/types/database.types';

const DIVISIONS: Division[] = ['rookie', 'regular', 'savage', 'elite'];

type Props = {
  recap: readonly EventRecapRow[];
};

export function EventRecapSection({ recap }: Props) {
  const t = useTranslations('events.recap');
  const tDiv = useTranslations('divisions');

  if (recap.length === 0) return null;

  return (
    <section className="space-y-4 rounded-md border border-accent/30 bg-card p-4">
      <header>
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-accent">{t('title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DIVISIONS.map((division) => {
          const rows = recap.filter((r) => r.division === division);
          if (rows.length === 0) return null;

          return (
            <article key={division} className="rounded-md border border-border bg-muted/30 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.18em]">{tDiv(division)}</h3>
              <ol className="mt-2 space-y-1.5">
                {rows.map((row) => (
                  <li key={row.userId} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-black tabular-nums text-muted-foreground">
                      #{row.rank}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-bold uppercase">
                      {row.username}
                    </span>
                    <span className="font-black tabular-nums">{row.totalPoints}</span>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
