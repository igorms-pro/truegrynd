'use client';

import { useTranslations } from 'next-intl';

import { AdminChallengeQueue } from '@/features/admin/components/AdminChallengeQueue';

export default function AdminChallengesPage() {
  const t = useTranslations('admin');

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>
      <AdminChallengeQueue />
    </section>
  );
}
