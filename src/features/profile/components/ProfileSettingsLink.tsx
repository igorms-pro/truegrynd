'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export function ProfileSettingsLink() {
  const t = useTranslations('profile.settings');
  const locale = useLocale();
  const href = `/${locale}/app/settings`;

  return (
    <Link
      href={href}
      aria-label={t('aria')}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Settings className="h-5 w-5" aria-hidden />
    </Link>
  );
}
