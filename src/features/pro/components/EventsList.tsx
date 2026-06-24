'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { eventPhase } from '@/features/pro/lib/eventPhase';
import { listGymEvents, type GymEvent } from '@/features/pro/services/events';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function formatWindow(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventRow({ event }: { event: GymEvent }) {
  const locale = useLocale();
  const t = useTranslations('pro.events');
  const phase = eventPhase(event.startsAt, event.endsAt);
  const badgeTone =
    phase === 'live'
      ? 'bg-primary text-primary-foreground'
      : phase === 'upcoming'
        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
        : 'bg-muted text-muted-foreground';

  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={`/${locale}/app/pro/events/${event.id}`}
        className="flex items-center gap-3 px-3 py-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold">{event.title}</span>
          <span className="block text-xs text-muted-foreground">
            {formatWindow(event.startsAt, locale)} → {formatWindow(event.endsAt, locale)}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${badgeTone}`}
        >
          {t(`phase.${phase}`)}
        </span>
      </Link>
    </li>
  );
}

export function EventsList() {
  const t = useTranslations('pro.events');
  const locale = useLocale();
  const { state } = useAsyncResource(listGymEvents, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('intro')}</p>
        <Link
          href={`/${locale}/app/pro/events/new`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('create.cta')}
        </Link>
      </div>

      {state.status === 'loading' || state.status === 'idle' ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold text-primary">{t('error')}</p>
      ) : state.data.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          {state.data.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      )}
    </div>
  );
}
