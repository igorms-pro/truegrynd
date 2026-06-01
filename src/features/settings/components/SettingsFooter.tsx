'use client';

import { useTranslations } from 'next-intl';

import { SignOutButton } from '@/features/auth/components/SignOutButton';
import { formatAppVersionLabel } from '@/lib/appVersion';

export function SettingsFooter() {
  const t = useTranslations('settings.footer');
  const versionLabel = formatAppVersionLabel(
    process.env.NODE_ENV === 'production' ? 'production' : 'development',
  );

  return (
    <footer className="space-y-4 border-t border-border pt-6">
      <SignOutButton variant="footer" />
      <p className="text-center text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {versionLabel}
      </p>
      <p className="text-center text-[10px] text-muted-foreground">{t('logoutHint')}</p>
    </footer>
  );
}
