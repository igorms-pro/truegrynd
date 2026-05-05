'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { APP_TABS, isTabActive } from '@/features/appshell/lib/tabs';

function activeClassName(isActive: boolean): string {
  return [
    'relative px-1 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  ].join(' ');
}

export function DesktopNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('app.tabs');

  return (
    <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
      {APP_TABS.map((tab) => {
        const active = isTabActive(pathname, locale, tab);
        return (
          <Link
            key={tab.id}
            href={`/${locale}${tab.path}`}
            className={activeClassName(active)}
            aria-current={active ? 'page' : undefined}
          >
            {t(tab.labelKey)}
            {active ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-[5px] left-0 right-0 h-[2px] bg-primary"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
