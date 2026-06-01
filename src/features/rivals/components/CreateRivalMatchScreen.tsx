'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { RivalChallengePicker } from '@/features/rivals/components/RivalChallengePicker';
import { useCreateRivalMatch } from '@/features/rivals/hooks/useCreateRivalMatch';
import { useProfile } from '@/features/profile/hooks/useProfile';
import {
  buildCreateRivalMatchSchema,
  type CreateRivalMatchFormValues,
} from '@/features/rivals/lib/createRivalMatchSchema';

const DEFAULT_VALUES: CreateRivalMatchFormValues = {
  challengeIds: [],
  durationHours: 24,
  inviteeUsername: '',
};

export function CreateRivalMatchScreen() {
  const t = useTranslations('rivals.create');
  const tVal = useTranslations('rivals.create.validation');
  const tDivisions = useTranslations('divisions');
  const tErrors = useTranslations('rivals.errors');
  const locale = useLocale();
  const router = useRouter();
  const profileState = useProfile();
  const {
    challenges,
    loadingChallenges,
    challengesError,
    busy,
    errorKey,
    submit,
    clearError,
    reloadChallenges,
  } = useCreateRivalMatch();

  const schema = useMemo(() => buildCreateRivalMatchSchema(tVal), [tVal]);
  const form = useForm<CreateRivalMatchFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const selectedIds = useWatch({ control: form.control, name: 'challengeIds' }) ?? [];
  const profile = profileState.state.status === 'ready' ? profileState.state.profile : null;

  const toggleChallenge = (challengeId: string) => {
    const current = form.getValues('challengeIds');
    if (current.includes(challengeId)) {
      form.setValue(
        'challengeIds',
        current.filter((id) => id !== challengeId),
        { shouldValidate: true },
      );
      return;
    }
    if (current.length >= 3) return;
    form.setValue('challengeIds', [...current, challengeId], { shouldValidate: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    clearError();
    try {
      await submit(values);
      router.push(`/${locale}/app/rivals`);
    } catch {
      /* hook sets errorKey */
    }
  });

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/app/rivals`}
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('back')}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        {profile ? (
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('divisionHint', { division: tDivisions(profile.division) })}
          </p>
        ) : null}
      </header>

      {errorKey ? (
        <p
          className="rounded-md border border-primary/40 bg-card p-3 text-sm text-primary"
          role="alert"
        >
          {tErrors(errorKey)}
        </p>
      ) : null}

      <form className="space-y-6" onSubmit={onSubmit}>
        <Controller
          name="challengeIds"
          control={form.control}
          render={({ fieldState }) => (
            <div>
              <RivalChallengePicker
                challenges={challenges}
                selectedIds={selectedIds}
                loading={loadingChallenges}
                error={challengesError}
                disabled={busy}
                onToggle={toggleChallenge}
                onRetry={reloadChallenges}
                selectedLabel={t('picker.selected', { count: selectedIds.length })}
                labels={{
                  title: t('picker.title'),
                  hint: t('picker.hint'),
                  loading: t('picker.loading'),
                  error: t('picker.error'),
                  retry: t('picker.retry'),
                  empty: t('picker.empty'),
                }}
              />
              {fieldState.error ? (
                <p className="mt-2 text-xs font-semibold text-primary" role="alert">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <fieldset className="space-y-3" disabled={busy}>
          <legend className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('duration.title')}
          </legend>
          <Controller
            name="durationHours"
            control={form.control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {[24, 168].map((hours) => (
                  <label
                    key={hours}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-xs font-black uppercase tracking-[0.18em]"
                  >
                    <input
                      type="radio"
                      value={hours}
                      checked={field.value === hours}
                      onChange={() => field.onChange(hours as 24 | 168)}
                      className="accent-primary"
                    />
                    {hours === 24 ? t('duration.h24') : t('duration.d7')}
                  </label>
                ))}
              </div>
            )}
          />
        </fieldset>

        <div>
          <label
            htmlFor="rival-invitee"
            className="text-xs font-black uppercase tracking-[0.18em] text-primary"
          >
            {t('invitee.label')}
          </label>
          <input
            id="rival-invitee"
            type="text"
            autoComplete="off"
            disabled={busy}
            className="mt-2 w-full rounded-md border border-border bg-card px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={t('invitee.placeholder')}
            {...form.register('inviteeUsername')}
          />
          <p className="mt-1 text-xs text-muted-foreground">{t('invitee.hint')}</p>
          {form.formState.errors.inviteeUsername ? (
            <p className="mt-2 text-xs font-semibold text-primary" role="alert">
              {form.formState.errors.inviteeUsername.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('submitting') : t('submit')}
        </button>
      </form>
    </section>
  );
}
