'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { createGym } from '@/features/pro/services/gym';

/** Server `code`s that map to a dedicated message; anything else falls back to `error.generic`. */
const KNOWN_ERRORS = new Set([
  'invalid_siret',
  'company_not_found',
  'company_closed',
  'gym_already_claimed',
  'registry_unreachable',
  'registry_error',
]);

export function CreateGymScreen() {
  const t = useTranslations('pro.createGym');
  const locale = useLocale();
  const [siret, setSiret] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const digits = siret.replace(/\D/g, '');
  const canSubmit = !submitting && (digits.length === 9 || digits.length === 14);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorCode(null);
    try {
      await createGym({ siret: digits });
      // Full reload so the server-provided profile (now gym_admin + affiliated) refreshes.
      window.location.href = `/${locale}/app/pro`;
    } catch (err) {
      const code = err instanceof Error ? err.message : 'generic';
      setErrorCode(KNOWN_ERRORS.has(code) ? code : 'generic');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('intro')}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-md border border-border bg-card p-5"
      >
        <label className="block space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('siretLabel')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            placeholder="848 359 154 00020"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-muted-foreground">{t('siretHint')}</span>
        </label>

        {errorCode ? (
          <p role="alert" className="text-sm font-semibold text-primary">
            {t(`error.${errorCode}`)}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="text-xs text-muted-foreground">{t('moat')}</p>
    </div>
  );
}
