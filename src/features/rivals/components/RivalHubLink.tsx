'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export function RivalHubLink() {
  const t = useTranslations('rivals.hubLink');
  const locale = useLocale();
  const href = `/${locale}/app/rivals`;

  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={t('openAria')}
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
        <p className="text-sm font-black uppercase tracking-tight">{t('cta')}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden />
    </Link>
  );
}
