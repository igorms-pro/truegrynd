'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AdminWeeklyScheduler } from '@/features/admin/components/AdminWeeklyScheduler';

export default function AdminWeeklyPage() {
  const t = useTranslations('admin.weekly');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href={`/${locale}/app/admin/challenges`}
            className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            ← {tAdmin('nav.link')}
          </Link>
          <Link
            href={`/${locale}/app/admin/events`}
            className="text-xs font-black uppercase tracking-[0.18em] text-accent hover:opacity-90"
          >
            {tAdmin('eventsLink')}
          </Link>
          <Link
            href={`/${locale}/app/admin/proof`}
            className="text-xs font-black uppercase tracking-[0.18em] text-accent hover:opacity-90"
          >
            {tAdmin('proofLink')}
          </Link>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>
      <AdminWeeklyScheduler />
    </section>
  );
}
