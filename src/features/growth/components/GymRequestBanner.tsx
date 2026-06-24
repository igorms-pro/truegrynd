'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { submitGymRequest } from '@/features/growth/services/gymRequest';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';

/**
 * PLG loop: a B2C athlete asks for their box to join TrueGrynd. Aggregated server-side into
 * leads. Render this only for athletes without an affiliated gym.
 */
export function GymRequestBanner() {
  const t = useTranslations('growth.gymRequest');
  const [open, setOpen] = useState(false);
  const [gymName, setGymName] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || gymName.trim().length < 2) return;
    setBusy(true);
    setError(null);
    try {
      await submitGymRequest({ gymName, city });
      trackEvent(ANALYTICS_EVENTS.plgGymRequested, { hasCity: city.trim().length > 0 });
      setDone(true);
    } catch {
      setError(t('error'));
      setBusy(false);
    }
  }

  if (done) {
    return (
      <article className="rounded-lg border border-primary/40 bg-card p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('thanksTitle')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('thanksBody')}</p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">{t('title')}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>

      {open ? (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            type="text"
            value={gymName}
            onChange={(e) => setGymName(e.target.value)}
            placeholder={t('gymPlaceholder')}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t('cityPlaceholder')}
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {error ? <p className="text-xs font-semibold text-primary">{error}</p> : null}
          <button
            type="submit"
            disabled={busy || gymName.trim().length < 2}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? t('submitting') : t('submit')}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
        >
          {t('cta')}
        </button>
      )}
    </article>
  );
}
