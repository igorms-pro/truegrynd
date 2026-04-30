'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { Faction } from '@/lib/types/database.types';
import { setFaction } from '@/features/onboarding/services/onboarding';

type Props = {
  userId: string;
  onCompleted: () => Promise<void> | void;
  initialFaction?: Faction | null;
  onBack?: () => void;
};

const FACTIONS: Array<{ faction: Faction; colorVar: string }> = [
  { faction: 'nomads', colorVar: 'var(--faction-nomads)' },
  { faction: 'horde', colorVar: 'var(--faction-horde)' },
  { faction: 'iron_alliance', colorVar: 'var(--faction-iron)' },
];

export function OnboardingFactionStep({ userId, onCompleted, initialFaction, onBack }: Props) {
  const t = useTranslations('onboarding');
  const [selected, setSelected] = useState<Faction | null>(initialFaction ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedLabel = selected ? t(`factions.${selected}`) : null;

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await setFaction({ userId, faction: selected });
      await onCompleted();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(`${t('errors.saveFactionFailed')} (${message})`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {t('faction.copy')}
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight">{t('faction.heading')}</h2>
        {selectedLabel ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {t('faction.selected', { faction: selectedLabel })}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{t('faction.selectPrompt')}</p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {FACTIONS.map(({ faction, colorVar }) => {
          const isActive = selected === faction;
          return (
            <button
              key={faction}
              type="button"
              onClick={() => {
                setSelected(faction);
                setError(null);
              }}
              disabled={saving}
              className={`w-full rounded-lg border bg-background p-4 text-left transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                borderColor: isActive ? colorVar : undefined,
              }}
              aria-label={t(`factions.${faction}`)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black tracking-tight">{t(`factions.${faction}`)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(`factions.${faction}Desc`)}
                  </p>
                </div>

                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: colorVar,
                    opacity: isActive ? 1 : 0.35,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="h-12 w-12 rounded-lg border border-border bg-background text-foreground transition-opacity hover:opacity-90"
            aria-label={t('buttons.back')}
          >
            <span className="inline-flex items-center justify-center">
              <ArrowLeft size={20} />
            </span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          disabled={!selected || saving}
          onClick={() => void handleSave()}
          className="h-12 w-12 rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label={saving ? t('buttons.saving') : t('faction.pledge')}
        >
          <span className="inline-flex items-center justify-center">
            <ArrowRight size={20} />
          </span>
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">{error}</p>
        </div>
      ) : null}
    </section>
  );
}
