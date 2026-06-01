'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { AdminWeeklyScheduler } from '@/features/admin/components/AdminWeeklyScheduler';

export default function AdminWeeklyPage() {
  const t = useTranslations('admin.weekly');
  const tAdmin = useTranslations('admin.nav');
  const locale = useLocale();

  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Link
          href={`/${locale}/app/admin/challenges`}
          className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← {tAdmin('link')}
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>
      <AdminWeeklyScheduler />
    </section>
  );
}
