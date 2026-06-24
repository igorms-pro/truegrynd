'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { getBillingStatus, startCheckout } from '@/features/pro/services/billing';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { isPlatformAdmin } from '@/lib/roles';

/**
 * Gates the PRO surface on an active subscription. trialing/active pass (the pilot is never
 * locked); canceled/past_due/none get a subscribe wall. Platform admins always pass (oversight).
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const t = useTranslations('pro.billing');
  const profile = useOptionalAppProfile();
  const { state } = useAsyncResource(getBillingStatus, []);
  const [busy, setBusy] = useState(false);

  // Admins oversee everything; while loading, don't flash a wall.
  if (isPlatformAdmin(profile)) return <>{children}</>;
  if (state.status !== 'ready' || !state.data) return <>{children}</>;
  if (state.data.isActive) return <>{children}</>;

  async function subscribe() {
    setBusy(true);
    try {
      const url = await startCheckout(window.location.href);
      window.location.href = url;
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-md border border-primary/40 bg-card p-6 text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
        {t(`status.${state.data.status}`)}
      </p>
      <h2 className="text-xl font-black uppercase tracking-tight">{t('gateTitle')}</h2>
      <p className="text-sm text-muted-foreground">{t('gateBody')}</p>
      <button
        type="button"
        disabled={busy}
        onClick={subscribe}
        className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? t('loading') : t('subscribe')}
      </button>
    </div>
  );
}
