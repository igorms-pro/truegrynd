'use client';

import { useTranslations } from 'next-intl';

import type { WeeklyCompletion } from '@/features/profile/services/passport';

type Props = {
  weeklies: WeeklyCompletion[];
  loading?: boolean;
};

export function PassportWeeklySection({ weeklies, loading }: Props) {
  const t = useTranslations('profile.passport.weekly');

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
      className="rounded-sm border border-border bg-card p-4 space-y-3"
      aria-labelledby="passport-weekly-title"
    >
      <h2
        id="passport-weekly-title"
        className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
      >
        {t('title')}
      </h2>
      <p className="text-sm text-muted-foreground">{t('body')}</p>

      {weeklies.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="space-y-2">
          {weeklies.map((w) => (
            <li
              key={w.id}
              className="flex items-start justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                  {w.weekLabel ?? t('weekFallback')}
                </p>
                <p className="text-sm font-semibold">{w.challengeTitle}</p>
              </div>
              <span className="shrink-0 rounded-sm border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-accent">
                {t('badge')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
