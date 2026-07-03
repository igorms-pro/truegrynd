'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CreateChallengeCircuitSection } from '@/features/challenges/components/CreateChallengeCircuitSection';
import { CreateChallengeScoringSection } from '@/features/challenges/components/CreateChallengeScoringSection';
import { buildFullChallengeRules } from '@/features/challenges/lib/circuitBlocks';
import {
  buildGymEventSchema,
  GYM_EVENT_DEFAULT_VALUES,
  type GymEventFormValues,
} from '@/features/pro/lib/gymEventSchema';
import { createGymEvent } from '@/features/pro/services/events';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-primary" role="alert">
      {message}
    </p>
  );
}

export function CreateGymEventScreen() {
  const t = useTranslations('pro.events.create');
  const tcc = useTranslations('arena.create.validation');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const schema = useMemo(() => buildGymEventSchema(tcc, t), [tcc, t]);
  const form = useForm<GymEventFormValues>({
    resolver: zodResolver(schema),
    defaultValues: GYM_EVENT_DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setBusy(true);
    setErrorKey(null);
    try {
      const workout = buildFullChallengeRules({
        scoringMode: values.scoringMode,
        amrapCap: values.amrapCap,
        forTimeFinishCap: values.forTimeCap,
        circuitBlocks: values.circuitBlocks,
        rulesDetail: values.rulesDetail,
      });
      await createGymEvent({
        title: values.title,
        description: values.description,
        workout,
        scoreType: values.scoringMode === 'for_time' ? 'time' : 'reps',
        startsAt: values.startsAt,
        endsAt: values.endsAt,
      });
      router.push(`/${locale}/app/pro/events`);
    } catch {
      setErrorKey('error');
      setBusy(false);
    }
  });

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/${locale}/app/pro/events`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      {errorKey ? (
        <p className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          {t(errorKey)}
        </p>
      ) : null}

      <FormProvider {...form}>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-5 rounded-md border border-border bg-card p-4 sm:p-6">
            <div>
              <label
                htmlFor="ev-title"
                className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
              >
                {t('fields.title')}
              </label>
              <input
                id="ev-title"
                type="text"
                autoComplete="off"
                disabled={busy}
                className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register('title')}
              />
              <FieldError message={form.formState.errors.title?.message} />
            </div>

            <div>
              <label
                htmlFor="ev-description"
                className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
              >
                {t('fields.description')}
              </label>
              <textarea
                id="ev-description"
                rows={3}
                disabled={busy}
                className="mt-2 w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...form.register('description')}
              />
              <FieldError message={form.formState.errors.description?.message} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="ev-starts"
                  className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {t('fields.startsAt')}
                </label>
                <input
                  id="ev-starts"
                  type="datetime-local"
                  disabled={busy}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register('startsAt')}
                />
                <FieldError message={form.formState.errors.startsAt?.message} />
              </div>
              <div>
                <label
                  htmlFor="ev-ends"
                  className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {t('fields.endsAt')}
                </label>
                <input
                  id="ev-ends"
                  type="datetime-local"
                  disabled={busy}
                  className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register('endsAt')}
                />
                <FieldError message={form.formState.errors.endsAt?.message} />
              </div>
            </div>
          </div>

          <CreateChallengeCircuitSection disabled={busy} />
          <CreateChallengeScoringSection disabled={busy} />

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {busy ? t('submitting') : t('submit')}
          </button>
        </form>
      </FormProvider>
    </section>
  );
}
