'use client';

import { useTranslations } from 'next-intl';

export default function OverviewPage() {
  const t = useTranslations('app');

  return (
    <section className="space-y-3">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t('overviewTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('overviewBody')}</p>
    </section>
  );
}
