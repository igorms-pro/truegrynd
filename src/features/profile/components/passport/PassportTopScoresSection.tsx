'use client';

import { useTranslations } from 'next-intl';

import type { PassportTopScore } from '@/features/profile/services/passport';
import { formatScore } from '@/lib/scoring';

type Props = {
  scores: PassportTopScore[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function PassportTopScoresSection({ scores, loading, error, onRetry }: Props) {
  const t = useTranslations('profile.passport.topScores');
  const tRating = useTranslations('profile.rating.axes');

  if (loading) {
    return (
      <section className="rounded-sm border border-border bg-card p-4" aria-busy="true">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-sm border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary" role="alert">
          {t('error')}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="rounded-sm border border-border bg-card p-4 space-y-3"
      aria-labelledby="passport-top-scores-title"
    >
      <h2
        id="passport-top-scores-title"
        className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
      >
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground">{t('body')}</p>

      {scores.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {scores.map((row) => (
            <li
              key={row.axis}
              className="rounded-sm border border-border bg-muted/20 px-3 py-3 space-y-1"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                {tRating(row.axis)}
              </p>
              <p className="text-sm font-black uppercase tracking-tight">{row.challengeTitle}</p>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-lg font-black tabular-nums">
                  {formatScore(row.value, row.scoreType)}
                </span>
                {row.topPercent != null ? (
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-accent">
                    {t('topPercent', { percent: row.topPercent })}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
