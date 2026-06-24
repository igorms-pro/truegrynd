'use client';

import { Radio } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { listGymEvents, type GymEvent } from '@/features/pro/services/events';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function isCastable(event: GymEvent): boolean {
  // Live or upcoming — no point casting a finished event.
  return Date.now() <= new Date(event.endsAt).getTime();
}

export function TvList() {
  const t = useTranslations('pro.events.tv');
  const locale = useLocale();
  const { state } = useAsyncResource(listGymEvents, []);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const castable = state.data.filter(isCastable);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('listIntro')}</p>
      {castable.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('listEmpty')}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {castable.map((event) => (
            <li key={event.id}>
              <Link
                href={`/${locale}/app/pro/events/${event.id}/tv`}
                className="flex items-center gap-3 rounded-md border border-border bg-card p-4 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Radio className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-sm font-black uppercase tracking-[0.12em]">
                  {event.title}
                </span>
                <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                  {t('cast')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
