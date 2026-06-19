'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { PRO_NAV } from '@/features/pro/lib/proNav';
import { fetchGymOverview } from '@/features/pro/services/dashboard';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { isGymManager } from '@/lib/roles';

function GymKpis() {
  const t = useTranslations('pro.dashboard.kpi');
  const { state } = useAsyncResource(fetchGymOverview, []);
  const ready = state.status === 'ready' ? state.data : null;

  const cards: ReadonlyArray<{ key: string; value: number | null }> = [
    { key: 'members', value: ready?.memberCount ?? null },
    { key: 'pending', value: ready?.pendingCount ?? null },
    { key: 'active7d', value: ready?.active7dCount ?? null },
  ];

  return (
    <ul className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <li key={c.key} className="rounded-md border border-border bg-card p-4">
          <p className="text-2xl font-black tabular-nums">
            {state.status === 'error' ? '—' : (c.value ?? '·')}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            {t(c.key)}
          </p>
        </li>
      ))}
    </ul>
  );
}

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

      <GymKpis />

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
