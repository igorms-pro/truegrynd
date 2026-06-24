'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  getBillingStatus,
  openPortal,
  startCheckout,
  type BillingStatus,
} from '@/features/pro/services/billing';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function StatusBadge({ status }: { status: BillingStatus['status'] }) {
  const t = useTranslations('pro.billing');
  const tone =
    status === 'active' || status === 'trialing'
      ? 'bg-primary text-primary-foreground'
      : status === 'past_due'
        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
        : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`rounded-sm px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function BillingBody({ data }: { data: BillingStatus }) {
  const t = useTranslations('pro.billing');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go(action: 'checkout' | 'portal') {
    setBusy(true);
    setError(null);
    try {
      const returnUrl = window.location.href;
      const url =
        action === 'checkout' ? await startCheckout(returnUrl) : await openPortal(returnUrl);
      window.location.href = url;
    } catch {
      setError(t('error'));
      setBusy(false);
    }
  }

  // 'active'/'trialing' → manage; anything else → subscribe.
  const subscribed = data.status === 'active' || data.status === 'trialing';

  return (
    <div className="max-w-md space-y-5">
      <div className="space-y-3 rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-[0.12em]">{data.gymName}</span>
          <StatusBadge status={data.status} />
        </div>
        <p className="text-sm text-muted-foreground">{t('plan')}</p>
        {data.currentPeriodEnd ? (
          <p className="text-xs text-muted-foreground">
            {t('renews', { date: new Date(data.currentPeriodEnd).toLocaleDateString() })}
          </p>
        ) : null}

        {error ? <p className="text-sm font-semibold text-primary">{error}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={() => go(subscribed ? 'portal' : 'checkout')}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('loading') : subscribed ? t('manage') : t('subscribe')}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{t('note')}</p>
    </div>
  );
}

export function BillingScreen() {
  const t = useTranslations('pro.billing');
  const { state } = useAsyncResource(getBillingStatus, []);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error' || !state.data) {
    return <p className="text-sm text-muted-foreground">{t('noGym')}</p>;
  }
  return <BillingBody data={state.data} />;
}
