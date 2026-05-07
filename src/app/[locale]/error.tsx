'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: Props) {
  const locale = useLocale();
  const t = useTranslations('errors.app');

  useEffect(() => {
    // Intentionally no console logging in production.
    void error;
  }, [error]);

  return (
    <main className="min-h-screen bg-background text-foreground px-4 pt-24">
      <div className="mx-auto w-full max-w-lg space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('label')}</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
          <Link
            href={`/${locale}/app/overview`}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </main>
  );
}
