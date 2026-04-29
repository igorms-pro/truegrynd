'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { completeInitiation } from '@/features/onboarding/services/onboarding';

type Props = {
  userId: string;
  onCompleted: () => Promise<void> | void;
  alreadyCompleted?: boolean;
  onContinue: () => void;
};

export function OnboardingInitiationStep({
  userId,
  onCompleted,
  alreadyCompleted,
  onContinue,
}: Props) {
  const t = useTranslations('onboarding');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => !saving, [saving]);

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (!alreadyCompleted) {
        await completeInitiation(userId);
        await onCompleted();
      }
      onContinue();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(`${t('errors.completeInitiationFailed')} (${message})`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {t('initiation.copy')}
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight">{t('initiation.heading')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('initiation.subheading')}</p>
      </div>

      <div className="mt-6 space-y-3">
        {([1, 2, 3] as const).map((i) => (
          <div key={i} className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-black tracking-tight">{t(`initiation.cards.${i}.title`)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t(`initiation.cards.${i}.body`)}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => void handleContinue()}
        className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-black text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? t('buttons.saving') : t('buttons.continue')}
      </button>

      {error ? (
        <div className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">{error}</p>
        </div>
      ) : null}
    </section>
  );
}
