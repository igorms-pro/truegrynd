'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { DesktopNavLink } from '@/features/appshell/components/DesktopNavLink';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { APP_TABS, isTabActive } from '@/features/appshell/lib/tabs';
import { canAccessPro } from '@/lib/roles';

export function DesktopNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('app.tabs');
  const tAdmin = useTranslations('admin.nav');
  const profile = useOptionalAppProfile();
  const adminHref = `/${locale}/app/admin/challenges`;
  const adminActive = pathname === adminHref || pathname.startsWith(`${adminHref}/`);
  const proHref = `/${locale}/app/pro`;

  return (
    <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
      {APP_TABS.map((tab) => {
        const active = isTabActive(pathname, locale, tab);
        return (
          <DesktopNavLink key={tab.id} href={`/${locale}${tab.path}`} isActive={active}>
            {t(tab.labelKey)}
          </DesktopNavLink>
        );
      })}
      {canAccessPro(profile) ? (
        <DesktopNavLink href={proHref} isActive={false}>
          PRO
        </DesktopNavLink>
      ) : null}
      {profile?.is_admin ? (
        <DesktopNavLink href={adminHref} isActive={adminActive}>
          {tAdmin('link')}
        </DesktopNavLink>
      ) : null}
    </nav>
  );
}
