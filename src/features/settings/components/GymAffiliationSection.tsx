'use client';

import { useTranslations } from 'next-intl';

export function GymAffiliationSection() {
  const t = useTranslations('settings.gym');

  return (
    <section className="rounded-md border border-border bg-card p-4 space-y-3">
      <header className="space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <div>
        <label
          htmlFor="settings-gym"
          className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground"
        >
          {t('currentGymLabel')}
        </label>
        <select
          id="settings-gym"
          disabled
          className="mt-2 w-full cursor-not-allowed rounded-md border border-border bg-muted px-3 py-3 text-sm text-muted-foreground opacity-70"
          aria-describedby="settings-gym-hint"
        >
          <option>{t('placeholder')}</option>
        </select>
        <p id="settings-gym-hint" className="mt-2 text-xs text-muted-foreground">
          {t('comingSoon')}
        </p>
      </div>
    </section>
  );
}
