'use client';

import { ChevronLeft, PanelLeft, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { notFound, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { CreateGymScreen } from '@/features/pro/components/CreateGymScreen';
import { SubscriptionGate } from '@/features/pro/components/SubscriptionGate';
import { PRO_NAV, isProItemActive } from '@/features/pro/lib/proNav';
import { getMyGym } from '@/features/pro/services/gym';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { canAccessPro, isGymManager } from '@/lib/roles';

/**
 * Dedicated PRO workspace shell: left sidebar (no B2C header), a "‹ App" way back, the gym
 * name, and the grouped nav. If the caller has no gym yet, it shows a focused onboarding
 * (create your gym) instead of the empty shell. Rendered by AppShell for every /pro route.
 */
export function ProShell({ children }: { children: ReactNode }) {
  const profile = useOptionalAppProfile();
  const locale = useLocale();
  const t = useTranslations('pro');
  const tNav = useTranslations('pro.nav');
  const pathname = usePathname();
  const loadGym = useCallback(() => getMyGym(), []);
  const { state } = useAsyncResource(loadGym, [profile?.affiliated_gym_id ?? '']);

  // Collapsed sidebar (desktop only) — persisted so the choice survives navigation/reload.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    // Read the persisted choice after mount (not in the initializer) so SSR and the first
    // client render agree — localStorage isn't available on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem('tg-pro-sidebar-collapsed') === '1');
  }, []);
  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('tg-pro-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  }, []);

  if (!canAccessPro(profile)) notFound();

  const hasGym = Boolean(profile?.affiliated_gym_id);
  const canManage = isGymManager(profile);
  const gymName = state.status === 'ready' && state.data ? state.data.name : null;

  const backToApp = (
    <Link
      href={`/${locale}/app/overview`}
      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
      {t('shell.backToApp')}
    </Link>
  );

  const themeControls = (
    <div className="flex items-center gap-1.5">
      <ThemeToggle size="sm" />
      <LanguageSwitcher variant="dropdown" size="sm" />
    </div>
  );

  // No gym yet → focused onboarding, not the empty shell.
  if (!hasGym) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            {backToApp}
            {themeControls}
          </div>
          <CreateGymScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <aside
        className={`border-b border-border md:min-h-screen md:shrink-0 md:border-b-0 md:border-r md:transition-[width] ${
          collapsed ? 'md:w-16' : 'md:w-60'
        }`}
      >
        <div className="space-y-4 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <span className={collapsed ? 'md:hidden' : ''}>{backToApp}</span>
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? tNav('expand') : tNav('collapse')}
              className="hidden shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" aria-hidden />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <div className={collapsed ? 'md:hidden' : ''}>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              {t('badge')}
            </p>
            <p className="mt-1 truncate text-sm font-black uppercase tracking-tight">
              {gymName ?? '…'}
            </p>
          </div>
          <nav className="flex flex-wrap gap-1 md:flex-col md:gap-4" aria-label={tNav('label')}>
            {PRO_NAV.map((group) => {
              const items = group.items.filter((it) => !it.managerOnly || canManage);
              if (items.length === 0) return null;
              return (
                <div key={group.id} className="w-full space-y-1">
                  {group.labelKey ? (
                    <p
                      className={`px-2 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground ${
                        collapsed ? 'md:hidden' : ''
                      }`}
                    >
                      {tNav(`groups.${group.labelKey}`)}
                    </p>
                  ) : null}
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isProItemActive(pathname, locale, item);
                    if (item.status === 'soon') {
                      return (
                        <div
                          key={item.id}
                          aria-disabled="true"
                          title={collapsed ? tNav(item.labelKey) : undefined}
                          className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground opacity-50 ${
                            collapsed ? 'md:justify-center' : ''
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden />
                          <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>
                            {tNav(item.labelKey)}
                          </span>
                          <span className={`ml-auto text-[8px] ${collapsed ? 'md:hidden' : ''}`}>
                            {tNav('soon')}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.id}
                        href={`/${locale}${item.path}`}
                        title={collapsed ? tNav(item.labelKey) : undefined}
                        className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                          collapsed ? 'md:justify-center' : ''
                        } ${
                          active
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>
                          {tNav(item.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>

          <div className={`border-t border-border pt-3 ${collapsed ? 'md:hidden' : ''}`}>
            {themeControls}
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <SubscriptionGate>{children}</SubscriptionGate>
      </main>
    </div>
  );
}
