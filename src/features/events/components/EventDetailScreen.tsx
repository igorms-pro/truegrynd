'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { EventLeaderboardSection } from '@/features/events/components/EventLeaderboardSection';
import { EventRecapSection } from '@/features/events/components/EventRecapSection';
import { useEventDetail } from '@/features/events/hooks/useEventDetail';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { getEventTimeRemaining } from '@/lib/events/getActiveEvents';
import type { Division } from '@/lib/types/database.types';

type Props = {
  slug: string;
};

export function EventDetailScreen({ slug }: Props) {
  const locale = useLocale();
  const t = useTranslations('events');
  const profile = useOptionalAppProfile();
  const [division, setDivision] = useState<Division>(profile?.division ?? 'rookie');
  const { state, refetch } = useEventDetail(slug, division);

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (state.status === 'not_found') {
    return <p className="text-sm text-muted-foreground">{t('notFound')}</p>;
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{t('error')}</p>
        <button
          type="button"
          onClick={refetch}
          className="rounded-md border border-border bg-muted px-3 py-2 text-xs font-black uppercase tracking-[0.18em]"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  const { event, standings, recap } = state;
  const remaining = getEventTimeRemaining(new Date(event.ends_at));
  const isActive = event.status === 'active' && !remaining.ended;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          {t(`types.${event.event_type}`)}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight">{event.title}</h1>
        {event.description ? (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        ) : null}
        <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
          {t(`status.${event.status}`)}
          {isActive ? ` · ${t('endsIn', { days: remaining.days, hours: remaining.hours })}` : null}
        </p>
      </header>

      <section className="space-y-3 rounded-md border border-border bg-card p-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em]">{t('challengesTitle')}</h2>
        <ol className="space-y-2">
          {event.challenges.map((ch) => (
            <li key={ch.challengeId}>
              <Link
                href={`/${locale}/app/arena/${ch.challengeId}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/20 px-3 py-2.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-bold uppercase tracking-tight">{ch.title}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                  {t('submitScore')}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <EventLeaderboardSection
        division={division}
        onDivisionChange={setDivision}
        standings={standings}
      />

      {event.status === 'completed' ? <EventRecapSection recap={recap} /> : null}
    </div>
  );
}
