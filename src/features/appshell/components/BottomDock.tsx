'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { APP_TABS, isTabActive, type AppTab } from '@/features/appshell/lib/tabs';

type DockItemProps = {
  tab: AppTab;
  isActive: boolean;
  href: string;
  label: string;
};

function DockItem({ tab, isActive, href, label }: DockItemProps) {
  const Icon = tab.icon;
  return (
    <li className="flex-1">
      <Link
        href={href}
        className="relative flex h-full flex-col items-center justify-center gap-1 px-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
      >
        {isActive ? (
          <span
            aria-hidden="true"
            className="absolute top-0 left-1/2 h-[2px] w-10 -translate-x-1/2 bg-primary"
          />
        ) : null}
        <Icon
          className={`h-5 w-5 transition-colors ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
        <span
          className={`text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

export function BottomDock() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('app.tabs');

  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 w-full max-w-md items-stretch">
        {APP_TABS.map((tab) => (
          <DockItem
            key={tab.id}
            tab={tab}
            isActive={isTabActive(pathname, locale, tab)}
            href={`/${locale}${tab.path}`}
            label={t(tab.labelKey)}
          />
        ))}
      </ul>
    </nav>
  );
}
