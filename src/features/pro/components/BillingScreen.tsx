'use client';

import { Check, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  getBillingStatus,
  openPortal,
  startCheckout,
  type BillingStatus,
} from '@/features/pro/services/billing';
import { useAsyncResource } from '@/hooks/useAsyncResource';

const FEATURES = ['judge', 'events', 'tv', 'leagues'] as const;

function StatusBadge({ status }: { status: BillingStatus['status'] }) {
  const t = useTranslations('pro.billing');
  const tone =
    status === 'active' || status === 'trialing'
      ? 'bg-emerald-500/15 text-emerald-500'
      : status === 'past_due'
        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
        : 'bg-muted text-muted-foreground';
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${tone}`}
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
      // Open Stripe in a new tab so the PRO workspace stays put; fall back to same-tab
      // navigation if the popup is blocked.
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) window.location.href = url;
      setBusy(false);
    } catch {
      setError(t('error'));
      setBusy(false);
    }
  }

  // 'active'/'trialing' → manage; anything else → subscribe.
  const subscribed = data.status === 'active' || data.status === 'trialing';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                {t('planName')}
              </p>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.12em]">{data.gymName}</p>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black tabular-nums tracking-tight">
              {t('priceAmount')}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">{t('pricePeriod')}</span>
          </div>

          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="h-3 w-3 text-emerald-500" aria-hidden />
                </span>
                {t(`features.${f}`)}
              </li>
            ))}
          </ul>

          {data.currentPeriodEnd ? (
            <p className="text-xs text-muted-foreground">
              {t('renews', { date: new Date(data.currentPeriodEnd).toLocaleDateString() })}
            </p>
          ) : null}

          {error ? <p className="text-sm font-semibold text-primary">{error}</p> : null}
        </div>

        <div className="border-t border-border bg-muted/30 p-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => go(subscribed ? 'portal' : 'checkout')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? t('loading') : subscribed ? t('manage') : t('subscribe')}
            {!busy ? <ExternalLink className="h-4 w-4" aria-hidden /> : null}
          </button>
        </div>
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
