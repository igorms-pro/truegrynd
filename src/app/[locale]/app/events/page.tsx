'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { EventsListScreen } from '@/features/events';

export default function EventsPage() {
  const locale = useLocale();
  const t = useTranslations('events');

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Link
          href={`/${locale}/app/overview`}
          className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← {t('backOverview')}
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('listTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('listSubtitle')}</p>
      </header>
      <EventsListScreen />
    </section>
  );
}
