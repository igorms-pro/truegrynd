'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  weeksAway: number;
  weeklyChallengeId: string | null;
  hasComebackEvent: boolean;
};

export function ComebackWeekBanner({ weeksAway, weeklyChallengeId, hasComebackEvent }: Props) {
  const t = useTranslations('growth.comeback');
  const locale = useLocale();

  const ctaHref = weeklyChallengeId
    ? `/${locale}/app/arena/${weeklyChallengeId}`
    : `/${locale}/app/arena`;

  return (
    <article className="rounded-md border border-l-4 border-accent/60 border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
        {hasComebackEvent ? t('eventKicker') : t('kicker')}
      </p>
      <p className="mt-2 text-sm text-foreground">{t('body', { weeks: weeksAway })}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t('hint')}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('cta')}
      </Link>
    </article>
  );
}
