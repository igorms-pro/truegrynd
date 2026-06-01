'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AdminChallengeQueue } from '@/features/admin/components/AdminChallengeQueue';

export default function AdminChallengesPage() {
  const locale = useLocale();
  const t = useTranslations('admin');

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        <Link
          href={`/${locale}/app/admin/weekly`}
          className="mt-2 mr-4 inline-block text-xs font-black uppercase tracking-[0.18em] text-accent hover:opacity-90"
        >
          {t('weeklyLink')}
        </Link>
        <Link
          href={`/${locale}/app/admin/events`}
          className="mt-2 mr-4 inline-block text-xs font-black uppercase tracking-[0.18em] text-accent hover:opacity-90"
        >
          {t('eventsLink')}
        </Link>
        <Link
          href={`/${locale}/app/admin/proof`}
          className="mt-2 inline-block text-xs font-black uppercase tracking-[0.18em] text-accent hover:opacity-90"
        >
          {t('proofLink')}
        </Link>
      </header>
      <AdminChallengeQueue />
    </section>
  );
}
