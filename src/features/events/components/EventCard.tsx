'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import type { ActiveEventSummary } from '@/lib/events/getActiveEvents';
import { getEventTimeRemaining } from '@/lib/events/getActiveEvents';

type Props = {
  event: ActiveEventSummary;
};

export function EventCard({ event }: Props) {
  const locale = useLocale();
  const t = useTranslations('events');
  const remaining = getEventTimeRemaining(new Date(event.ends_at));
  const isActive = event.status === 'active' && !remaining.ended;

  return (
    <article className="rounded-md border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          {t(`types.${event.event_type}`)}
        </p>
        <span
          className={[
            'rounded-sm border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]',
            isActive ? 'border-primary/50 text-primary' : 'border-border text-muted-foreground',
          ].join(' ')}
        >
          {t(`status.${event.status}`)}
        </span>
      </div>
      <h2 className="mt-2 text-lg font-black uppercase tracking-tight">{event.title}</h2>
      {event.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {t('challengeCount', { count: event.challengeCount })}
      </p>
      {isActive && !remaining.ended ? (
        <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-accent">
          {t('endsIn', { days: remaining.days, hours: remaining.hours })}
        </p>
      ) : null}
      <Link
        href={`/${locale}/app/events/${event.slug}`}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('viewEvent')}
      </Link>
    </article>
  );
}
