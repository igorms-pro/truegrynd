'use client';

import { useTranslations } from 'next-intl';

import type { EventStanding } from '@/features/events/services/events';
import type { Division } from '@/lib/types/database.types';

const DIVISIONS: Division[] = ['rookie', 'regular', 'savage', 'elite'];

type Props = {
  division: Division;
  onDivisionChange: (division: Division) => void;
  standings: readonly EventStanding[];
  loading?: boolean;
};

export function EventLeaderboardSection({
  division,
  onDivisionChange,
  standings,
  loading = false,
}: Props) {
  const t = useTranslations('events.leaderboard');
  const tDiv = useTranslations('divisions');

  return (
    <section className="space-y-4 rounded-md border border-border bg-card p-4">
      <header className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-[0.18em]">{t('title')}</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('divisionFilter')}>
          {DIVISIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDivisionChange(d)}
              aria-pressed={division === d}
              className={[
                'rounded-sm border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]',
                division === d
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {tDiv(d)}
            </button>
          ))}
        </div>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">{t('loading')}</p> : null}

      {!loading && standings.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : null}

      {!loading && standings.length > 0 ? (
        <ol className="divide-y divide-border">
          {standings.map((row, index) => (
            <li
              key={row.userId}
              className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="w-6 shrink-0 text-sm font-black tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <span className="truncate text-sm font-bold uppercase tracking-tight">
                  {row.username}
                </span>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-black tabular-nums">{row.totalPoints}</span>
                <p className="text-[10px] text-muted-foreground">
                  {t('challengesScored', { count: row.challengesScored })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
