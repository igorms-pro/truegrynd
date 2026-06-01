'use client';

import { useTranslations } from 'next-intl';

import type { ProfileRating } from '@/lib/rating';
import { RATING_AXES, type RatingAxis } from '@/lib/rating';

type Props = {
  rating: ProfileRating | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

function axisValue(rating: ProfileRating | null, axis: RatingAxis): number {
  if (!rating) return 0;
  return rating[axis];
}

function AxisRow({ axis, value }: { axis: RatingAxis; value: number }) {
  const t = useTranslations('profile.rating');
  const hasData = value > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-black uppercase tracking-[0.14em]">{t(`axes.${axis}`)}</span>
        <span className="font-mono tabular-nums text-muted-foreground">
          {hasData ? value : t('noData')}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-sm border border-border bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={hasData ? value : 0}
        aria-label={t('axisAria', { axis: t(`axes.${axis}`), value: hasData ? value : 0 })}
      >
        <div
          className="h-full bg-primary transition-[width] duration-300"
          style={{ width: hasData ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  );
}

export function ProfileRatingCard({ rating, loading, error, onRetry }: Props) {
  const t = useTranslations('profile.rating');

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

  const globalScore = rating?.global ?? 0;
  const hasRating = (rating?.validatedScoreCount ?? 0) > 0 || globalScore > 0;

  return (
    <section
      className="rounded-sm border border-border bg-card p-4"
      aria-labelledby="profile-rating-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="profile-rating-title"
            className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t('title')}
          </h2>
          <p className="mt-2 font-mono text-4xl font-black tabular-nums tracking-tight">
            {hasRating ? globalScore : t('noData')}
          </p>
        </div>
        {rating ? (
          <p className="text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('validatedCount', { count: rating.validatedScoreCount })}
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{t('explainer')}</p>

      <div className="mt-4 space-y-3">
        {RATING_AXES.map((axis) => (
          <AxisRow key={axis} axis={axis} value={axisValue(rating, axis)} />
        ))}
      </div>
    </section>
  );
}
