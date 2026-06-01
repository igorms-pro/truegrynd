'use client';

import { useTranslations } from 'next-intl';

import { useUnitPreference } from '@/features/settings/hooks/useUnitPreference';
import type { UnitSystem } from '@/features/settings/lib/unitPreference';

type Props = {
  disabled?: boolean;
};

export function PreferencesSection({ disabled = false }: Props) {
  const t = useTranslations('settings.preferences');
  const { unitSystem, setUnitSystem } = useUnitPreference();

  const onSelect = (value: UnitSystem) => {
    if (disabled) return;
    setUnitSystem(value);
  };

  return (
    <section className="rounded-md border border-border bg-card p-4 space-y-3">
      <header className="space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
      </header>

      <div role="group" aria-label={t('unitsLabel')}>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
          {t('unitsLabel')}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(['metric', 'imperial'] as const).map((value) => {
            const active = unitSystem === value;
            return (
              <button
                key={value}
                type="button"
                disabled={disabled}
                aria-pressed={active}
                onClick={() => onSelect(value)}
                className={[
                  'min-h-11 rounded-md border px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {t(`units.${value}`)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
