'use client';

import { useTranslations } from 'next-intl';

import { getWeeklyTimeRemaining } from '@/lib/weekly';
import type { ActiveWeeklyChallenge } from '@/lib/weekly';
import { resolveWeeklyDisplayLabel } from '@/features/overview/hooks/useWeeklyChallenge';

type Props = {
  weekly: ActiveWeeklyChallenge;
};

export function WeeklyChallengeBanner({ weekly }: Props) {
  const t = useTranslations('weekly');
  const label = resolveWeeklyDisplayLabel(weekly);
  const remaining = getWeeklyTimeRemaining(new Date(weekly.ends_at));

  return (
    <div
      className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3"
      role="status"
      aria-label={t('bannerAria', { label })}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
        {t('bannerTitle')}
      </p>
      <p className="mt-1 text-sm font-black uppercase tracking-tight text-foreground">{label}</p>
      {remaining ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {t('endsIn', { days: remaining.days, hours: remaining.hours })}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{t('ended')}</p>
      )}
    </div>
  );
}
