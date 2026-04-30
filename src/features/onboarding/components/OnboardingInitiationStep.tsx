'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { completeInitiation } from '@/features/onboarding/services/onboarding';
import type { Sex } from '@/lib/types/database.types';

type Props = {
  userId: string;
  onCompleted: () => Promise<void> | void;
  alreadyCompleted?: boolean;
  onContinue: () => void;
  sex: Sex | null;
};

export function OnboardingInitiationStep({
  userId,
  onCompleted,
  alreadyCompleted,
  onContinue,
  sex,
}: Props) {
  const t = useTranslations('onboarding');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<1 | 2 | 3, boolean>>({
    1: false,
    2: false,
    3: false,
  });

  const canContinue = useMemo(() => !saving, [saving]);
  const useFemale = sex === 'female';
  const imageFor = (i: 1 | 2 | 3) => {
    if (useFemale) return `/images/onboarding/onboarding_female_${i}.png`;
    return `/images/onboarding/onboarding_${i}.png`;
  };

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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-black tracking-tight">
                  {t(`initiation.cards.${i}.title`)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`initiation.cards.${i}.body`)}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [i]: !prev[i],
                  }))
                }
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-black tracking-tight transition-opacity hover:opacity-90 ${
                  collapsed[i]
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground'
                }`}
                aria-pressed={collapsed[i]}
                aria-label={
                  collapsed[i] ? t('initiation.toggleExpand') : t('initiation.toggleCollapse')
                }
              >
                {t('initiation.ok')}
              </button>
            </div>

            {collapsed[i] ? null : (
              <div className="relative mt-3 aspect-[9/16] w-full overflow-hidden rounded-lg border border-border bg-card">
                <Image
                  src={imageFor(i)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 420px"
                  priority={i === 1}
                />
              </div>
            )}
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
