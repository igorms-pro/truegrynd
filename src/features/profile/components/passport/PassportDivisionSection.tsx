'use client';

import { useTranslations } from 'next-intl';

import { DivisionBadge } from '@/components/DivisionBadge';
import type { RatingHistoryEntry } from '@/features/profile/services/passport';
import type { Division } from '@/lib/types/database.types';

type Props = {
  currentDivision: Division;
  divisions: Division[];
  history: RatingHistoryEntry[];
  loading?: boolean;
};

export function PassportDivisionSection({ currentDivision, divisions, history, loading }: Props) {
  const t = useTranslations('profile.passport.division');

  if (loading) {
    return (
      <section className="rounded-sm border border-border bg-card p-4" aria-busy="true">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-4"
      aria-labelledby="passport-division-title"
    >
      <div>
        <h2
          id="passport-division-title"
          className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
        >
          {t('title')}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <DivisionBadge division={currentDivision} />
          <span className="text-xs text-muted-foreground">{t('current')}</span>
        </div>
      </div>

      {divisions.length > 0 ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
            {t('reached')}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {divisions.map((d) => (
              <li key={d}>
                <DivisionBadge division={d} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {history.length > 0 ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
            {t('history')}
          </p>
          <ul className="mt-2 space-y-2">
            {history.slice(0, 6).map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
              >
                <DivisionBadge division={entry.division} />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {Math.round(entry.ratingGlobal)}
                </span>
                <time
                  dateTime={entry.recordedAt}
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {new Date(entry.recordedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t('historyEmpty')}</p>
      )}
    </section>
  );
}
