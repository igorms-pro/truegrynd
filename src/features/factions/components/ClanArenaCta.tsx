'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function ClanArenaCta() {
  const locale = useLocale();
  const t = useTranslations('clan');

  return (
    <Link
      href={`/${locale}/app/arena`}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {t('ctaArena')}
    </Link>
  );
}
