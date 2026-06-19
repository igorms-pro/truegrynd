'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { PRO_NAV } from '@/features/pro/lib/proNav';
import { isGymManager } from '@/lib/roles';

export function ProDashboard() {
  const t = useTranslations('pro');
  const tNav = useTranslations('pro.nav');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const canManage = isGymManager(profile);

  // Flatten every section except the dashboard itself into overview cards.
  const cards = PRO_NAV.flatMap((group) => group.items)
    .filter((item) => item.id !== 'dashboard')
    .filter((item) => !item.managerOnly || canManage);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('dashboard.intro')}</p>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          const isSoon = item.status === 'soon';
          const label = tNav(item.labelKey);

          const inner = (
            <div className="flex h-full flex-col gap-2 rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                {isSoon ? (
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                    {tNav('soon')}
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-black uppercase tracking-[0.12em] text-foreground">
                {label}
              </span>
            </div>
          );

          return (
            <li key={item.id}>
              {isSoon ? (
                <div aria-disabled="true" className="opacity-60">
                  {inner}
                </div>
              ) : (
                <Link
                  href={`/${locale}${item.path}`}
                  className="block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
