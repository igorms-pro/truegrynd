'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import type { Profile, Sex } from '@/lib/types/database.types';
import { upsertIdentity } from '@/features/onboarding/services/onboarding';

type IdentityFormValues = {
  username: string;
  sex: Sex;
  age: number;
  weightKg: number;
};

type Props = {
  userId: string;
  profile: Profile;
  onSaved: () => Promise<void> | void;
  onContinue: () => void;
};

const SEX_OPTIONS = ['male', 'female', 'other'] as const;

function createSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(2, { message: t('errors.usernameMinLength') })
      .max(24),
    sex: z.enum(SEX_OPTIONS, { message: t('errors.sexRequired') }),
    age: z
      .number()
      .int()
      .min(16, { message: t('errors.ageMin') })
      .max(100, { message: t('errors.ageMax') }),
    weightKg: z
      .number()
      .min(30, { message: t('errors.weightMin') })
      .max(300, { message: t('errors.weightMax') }),
  });
}

export function OnboardingIdentityStep({ userId, profile, onSaved, onContinue }: Props) {
  const t = useTranslations('onboarding');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const DRAFT_VERSION = 1;
  const draftKey = useMemo(
    () => `truegrynd:onboarding:identityDraft:v${DRAFT_VERSION}:${userId}`,
    [userId],
  );
  const [draftLoaded, setDraftLoaded] = useState(false);

  const schema = useMemo(() => createSchema((k) => t(k)), [t]);

  const form = useForm<IdentityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile.username ?? '',
      sex: profile.sex ?? 'other',
      age: profile.age ?? 0,
      weightKg: profile.weight_kg ?? 0,
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = form;

  const sexLabel = (sex: Sex) => t(`identity.sexes.${sex}`);

  const identityComplete =
    profile.username !== null &&
    profile.sex !== null &&
    profile.age !== null &&
    profile.weight_kg !== null;
  const canContinue = !saving && (identityComplete || isValid);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<IdentityFormValues>;
      if (typeof parsed !== 'object' || !parsed) return;
      const next: IdentityFormValues = {
        username: typeof parsed.username === 'string' ? parsed.username : (profile.username ?? ''),
        sex:
          parsed.sex === 'male' || parsed.sex === 'female' || parsed.sex === 'other'
            ? parsed.sex
            : (profile.sex ?? 'other'),
        age: typeof parsed.age === 'number' ? parsed.age : (profile.age ?? 0),
        weightKg: typeof parsed.weightKg === 'number' ? parsed.weightKg : (profile.weight_kg ?? 0),
      };
      reset(next);
    } catch {
      // ignore draft failures
    } finally {
      setDraftLoaded(true);
    }
  }, [draftKey, profile.age, profile.sex, profile.username, profile.weight_kg, reset]);

  useEffect(() => {
    if (!draftLoaded) return;
    if (saving) return;
    const values = watch();
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values));
      } catch {
        // ignore localStorage failures
      }
    }, 250);

    return () => window.clearTimeout(id);
  }, [draftLoaded, draftKey, saving, watch]);

  const onSubmit = async (values: IdentityFormValues) => {
    setSaving(true);
    setSubmitError(null);
    try {
      await upsertIdentity({
        userId,
        username: values.username.trim(),
        sex: values.sex,
        age: values.age,
        weightKg: values.weightKg,
      });
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // ignore localStorage failures
      }
      await onSaved();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setSubmitError(`${t('errors.saveIdentityFailed')} (${message})`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {t('identity.copy')}
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight">{t('identity.heading')}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold tracking-wide text-muted-foreground">
            {t('identity.usernameLabel')}
          </label>
          <input
            {...register('username')}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder={t('identity.usernamePlaceholder')}
            aria-invalid={!!errors.username}
          />
          {errors.username ? (
            <p className="mt-1 text-xs font-semibold text-primary">{errors.username.message}</p>
          ) : null}
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-muted-foreground">
            {t('identity.sexLabel')}
          </label>
          <select
            {...register('sex')}
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            aria-invalid={!!errors.sex}
          >
            {SEX_OPTIONS.map((sex) => (
              <option key={sex} value={sex}>
                {sexLabel(sex)}
              </option>
            ))}
          </select>
          {errors.sex ? (
            <p className="mt-1 text-xs font-semibold text-primary">{errors.sex.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-muted-foreground">
              {t('identity.ageLabel')}
            </label>
            <input
              {...register('age', { valueAsNumber: true })}
              type="number"
              inputMode="numeric"
              min={16}
              max={100}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-invalid={!!errors.age}
            />
            {errors.age ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.age.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-muted-foreground">
              {t('identity.weightLabel')}
            </label>
            <input
              {...register('weightKg', { valueAsNumber: true })}
              type="number"
              inputMode="decimal"
              min={30}
              max={300}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              aria-invalid={!!errors.weightKg}
            />
            {errors.weightKg ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.weightKg.message}</p>
            ) : null}
          </div>
        </div>

        {submitError ? (
          <div className="rounded-lg border border-primary/40 bg-primary/10 p-3">
            <p className="text-sm font-semibold text-primary">{submitError}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? t('buttons.saving') : t('buttons.save')}
        </button>

        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-black text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {t('buttons.continue')}
        </button>
      </form>
    </section>
  );
}
