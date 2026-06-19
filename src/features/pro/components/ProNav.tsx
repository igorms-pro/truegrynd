'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { PRO_NAV, isProItemActive, type ProNavItem } from '@/features/pro/lib/proNav';
import { isGymManager } from '@/lib/roles';

function itemClassName(isActive: boolean, isSoon: boolean): string {
  return [
    'inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors',
    isSoon
      ? 'cursor-not-allowed border-border bg-muted/30 text-muted-foreground/60'
      : isActive
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-border bg-background text-muted-foreground hover:text-foreground',
  ].join(' ');
}

export function ProNav() {
  const t = useTranslations('pro.nav');
  const locale = useLocale();
  const pathname = usePathname();
  const profile = useOptionalAppProfile();
  const canManage = isGymManager(profile);

  const visible = (item: ProNavItem) => !item.managerOnly || canManage;

  return (
    <nav aria-label={t('label')} className="space-y-3">
      {PRO_NAV.map((group) => {
        const items = group.items.filter(visible);
        if (items.length === 0) return null;

        return (
          <div key={group.id} className="space-y-2">
            {group.labelKey ? (
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">
                {t(`groups.${group.labelKey}`)}
              </p>
            ) : null}
            <ul className="flex flex-wrap gap-2">
              {items.map((item) => {
                const Icon = item.icon;
                const isSoon = item.status === 'soon';
                const isActive = !isSoon && isProItemActive(pathname, locale, item);
                const label = t(item.labelKey);
                const content = (
                  <>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                    {isSoon ? (
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[9px] tracking-normal">
                        {t('soon')}
                      </span>
                    ) : null}
                  </>
                );

                return (
                  <li key={item.id}>
                    {isSoon ? (
                      <span
                        className={itemClassName(false, true)}
                        aria-disabled="true"
                        title={t('soon')}
                      >
                        {content}
                      </span>
                    ) : (
                      <Link
                        href={`/${locale}${item.path}`}
                        className={itemClassName(isActive, false)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
