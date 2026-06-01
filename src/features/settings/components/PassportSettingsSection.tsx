'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { upsertIdentity } from '@/features/onboarding/services/onboarding';
import {
  createPassportSchema,
  SEX_OPTIONS,
  type PassportFormValues,
} from '@/features/settings/lib/passportSchema';
import type { Profile } from '@/lib/types/database.types';

type Props = {
  profile: Profile;
  onSaved: () => void;
};

export function PassportSettingsSection({ profile, onSaved }: Props) {
  const t = useTranslations('settings.passport');
  const tOnboarding = useTranslations('onboarding');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const schema = useMemo(() => createPassportSchema((key) => tOnboarding(key)), [tOnboarding]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<PassportFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile.username ?? '',
      sex: profile.sex ?? 'other',
      age: profile.age ?? 0,
      weightKg: profile.weight_kg ?? 0,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: PassportFormValues) => {
    setSaving(true);
    setSubmitError(null);
    setSaved(false);
    try {
      await upsertIdentity({
        userId: profile.id,
        username: values.username.trim(),
        sex: values.sex,
        age: values.age,
        weightKg: values.weightKg,
      });
      setSaved(true);
      onSaved();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setSubmitError(t('saveError', { message }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-md border border-border bg-card p-4 space-y-4">
      <header className="space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t('kicker')}</p>
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label
            htmlFor="settings-username"
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground"
          >
            {t('usernameLabel')}
          </label>
          <input
            id="settings-username"
            {...register('username')}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!!errors.username}
          />
          {errors.username ? (
            <p className="mt-1 text-xs font-semibold text-primary">{errors.username.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="settings-sex"
            className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground"
          >
            {t('sexLabel')}
          </label>
          <select
            id="settings-sex"
            {...register('sex')}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-invalid={!!errors.sex}
          >
            {SEX_OPTIONS.map((sex) => (
              <option key={sex} value={sex}>
                {tOnboarding(`identity.sexes.${sex}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="settings-age"
              className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground"
            >
              {t('ageLabel')}
            </label>
            <input
              id="settings-age"
              type="number"
              inputMode="numeric"
              min={16}
              max={100}
              {...register('age', { valueAsNumber: true })}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!errors.age}
            />
            {errors.age ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.age.message}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="settings-weight"
              className="text-xs font-black uppercase tracking-[0.14em] text-muted-foreground"
            >
              {t('weightLabel')}
            </label>
            <input
              id="settings-weight"
              type="number"
              inputMode="decimal"
              min={30}
              max={300}
              {...register('weightKg', { valueAsNumber: true })}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!errors.weightKg}
            />
            {errors.weightKg ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.weightKg.message}</p>
            ) : null}
          </div>
        </div>

        {submitError ? (
          <p className="text-xs font-semibold text-primary" role="alert">
            {submitError}
          </p>
        ) : null}
        {saved ? (
          <p className="text-xs font-semibold text-accent" role="status">
            {t('saved')}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!isValid || !isDirty || saving}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </form>
    </section>
  );
}
