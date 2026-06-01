'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CreateChallengeCircuitSection } from '@/features/challenges/components/CreateChallengeCircuitSection';
import { CreateChallengeScoringSection } from '@/features/challenges/components/CreateChallengeScoringSection';
import { CreateChallengeVariantsSection } from '@/features/challenges/components/CreateChallengeVariantsSection';
import { useCreateChallenge } from '@/features/challenges/hooks/useCreateChallenge';
import {
  buildCreateChallengeSchema,
  type CreateChallengeFormValues,
} from '@/features/challenges/lib/createChallengeSchema';

const DEFAULT_VALUES: CreateChallengeFormValues = {
  title: '',
  description: '',
  rulesDetail: '',
  circuitBlocks: [{ label: '', kind: 'reps', amount: '', movementSlug: '' }],
  scoringMode: 'for_time',
  amrapCap: '',
  forTimeCap: '',
  equipmentTagsRaw: '',
  variants: ['standard'],
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-primary" role="alert">
      {message}
    </p>
  );
}

export function CreateChallengeScreen() {
  const t = useTranslations('arena.create');
  const tVal = useTranslations('arena.create.validation');
  const locale = useLocale();
  const router = useRouter();
  const { busy, errorKey, submit, clearError } = useCreateChallenge();

  const schema = useMemo(() => buildCreateChallengeSchema(tVal), [tVal]);

  const form = useForm<CreateChallengeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    clearError();
    try {
      const challenge = await submit(values);
      router.push(`/${locale}/app/arena/${challenge.id}`);
    } catch {
      /* hook sets errorKey */
    }
  });

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/app/arena`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      {errorKey ? (
        <p className="rounded-sm border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
          {t(errorKey)}
        </p>
      ) : null}

      <FormProvider {...form}>
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="cc-title"
              className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t('fields.title')}
            </label>
            <input
              id="cc-title"
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
              htmlFor="cc-description"
              className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t('fields.description')}
            </label>
            <textarea
              id="cc-description"
              rows={4}
              disabled={busy}
              className="mt-2 w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...form.register('description')}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>

          <CreateChallengeCircuitSection disabled={busy} />

          <div>
            <label
              htmlFor="cc-rules-detail"
              className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t('fields.rulesDetail')}
            </label>
            <textarea
              id="cc-rules-detail"
              rows={6}
              disabled={busy}
              placeholder={t('fields.rulesDetailPlaceholder')}
              className="mt-2 w-full resize-y rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...form.register('rulesDetail')}
            />
            <FieldError message={form.formState.errors.rulesDetail?.message} />
          </div>

          <CreateChallengeScoringSection disabled={busy} />

          <CreateChallengeVariantsSection disabled={busy} />

          <div>
            <label
              htmlFor="cc-tags"
              className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
            >
              {t('fields.equipmentTags')}
            </label>
            <input
              id="cc-tags"
              type="text"
              autoComplete="off"
              disabled={busy}
              placeholder={t('fields.equipmentPlaceholder')}
              className="mt-2 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...form.register('equipmentTagsRaw')}
            />
            <FieldError message={form.formState.errors.equipmentTagsRaw?.message} />
          </div>

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
