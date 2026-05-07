'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function NotFound() {
  const locale = useLocale();
  const t = useTranslations('errors.notFound');

  return (
    <main className="min-h-screen bg-background text-foreground px-4 pt-24">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('label')}</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        <Link
          href={`/${locale}/app/overview`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('cta')}
        </Link>
      </div>
    </main>
  );
}
