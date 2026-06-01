'use client';

import { useTranslations } from 'next-intl';

import { EventCard } from '@/features/events/components/EventCard';
import { useEventsList } from '@/features/events/hooks/useEventsList';

export function EventsListScreen() {
  const t = useTranslations('events');
  const { state, refetch } = useEventsList();

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
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

  if (state.events.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {state.events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
