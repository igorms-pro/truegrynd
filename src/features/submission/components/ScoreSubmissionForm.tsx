'use client';

import { useCallback, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { useRequireAppAccess } from '@/features/appshell';
import { parseTimeInput } from '@/features/submission/lib/parseTime';
import { isAllowedVideoUrl } from '@/features/submission/lib/videoUrl';
import { submitScore, SUBMISSION_ERRORS } from '@/features/submission/services/submitScore';
import type { ScoreType } from '@/lib/types/database.types';

type FormValues = {
  time: string;
  reps: number;
  videoUrl: string;
};

type Props = {
  challengeId: string;
  scoreType: ScoreType;
  onSubmitted: (result: { ranked: boolean }) => void;
};

function createSchema(t: (key: string) => string, scoreType: ScoreType) {
  return z.object({
    time:
      scoreType === 'time'
        ? z.string().refine((v) => parseTimeInput(v) !== null, { message: t('errors.invalidTime') })
        : z.string(),
    reps:
      scoreType === 'reps'
        ? z
            .number()
            .int()
            .min(1, { message: t('errors.invalidReps') })
        : z.number(),
    videoUrl: z.string().refine((v) => v.trim().length === 0 || isAllowedVideoUrl(v), {
      message: t('errors.videoInvalid'),
    }),
  });
}

function parseScoreValue(values: FormValues, scoreType: ScoreType): number | null {
  if (scoreType === 'time') return parseTimeInput(values.time);
  if (!Number.isFinite(values.reps) || values.reps < 1) return null;
  return Math.floor(values.reps);
}

export function ScoreSubmissionForm({ challengeId, scoreType, onSubmitted }: Props) {
  const t = useTranslations('submission');
  const access = useRequireAppAccess();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => createSchema((k) => t(k), scoreType), [t, scoreType]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { time: '', reps: 0, videoUrl: '' },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid },
  } = form;

  const canInteract = access.status === 'ready' && !submitting;
  const canSubmit = canInteract && isValid;

  const setScoreError = useCallback(() => {
    if (scoreType === 'time')
      setError('time', { type: 'validate', message: t('errors.invalidTime') });
    else setError('reps', { type: 'validate', message: t('errors.invalidReps') });
  }, [scoreType, setError, t]);

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      if (access.status !== 'ready') return;
      setSubmitting(true);
      setSubmitError(null);

      const value = parseScoreValue(values, scoreType);
      if (value === null) {
        setSubmitting(false);
        setScoreError();
        return;
      }

      try {
        const res = await submitScore({
          challengeId,
          userId: access.profile.id,
          value,
          videoUrl: values.videoUrl,
        });
        onSubmitted({ ranked: res.ranked });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (message === SUBMISSION_ERRORS.VIDEO_INVALID) {
          setError('videoUrl', { type: 'validate', message: t('errors.videoInvalid') });
          return;
        }
        setSubmitError(`${t('errors.submitFailed')} (${message})`);
      } finally {
        setSubmitting(false);
      }
    },
    [access, challengeId, onSubmitted, scoreType, setError, setScoreError, t],
  );

  if (access.status !== 'ready') {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  const scoreLabel = scoreType === 'time' ? t('yourScoreTime') : t('yourScoreReps');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {scoreLabel}
        </p>

        {scoreType === 'time' ? (
          <div>
            <input
              {...register('time')}
              placeholder={t('timePlaceholder')}
              inputMode="numeric"
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono tabular-nums"
              aria-invalid={!!errors.time}
            />
            {errors.time ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.time.message}</p>
            ) : null}
          </div>
        ) : (
          <div>
            <input
              {...register('reps', { valueAsNumber: true })}
              type="number"
              placeholder={t('repsPlaceholder')}
              inputMode="numeric"
              min={1}
              className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono tabular-nums"
              aria-invalid={!!errors.reps}
            />
            {errors.reps ? (
              <p className="mt-1 text-xs font-semibold text-primary">{errors.reps.message}</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="rounded-md border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('proofTitle')}
        </p>
        <p className="text-sm text-muted-foreground">{t('proofBody')}</p>

        <label className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('videoLabelOptional')}
        </label>
        <input
          {...register('videoUrl')}
          className="mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="youtube.com/watch?v=..."
          aria-invalid={!!errors.videoUrl}
        />
        <p className="mt-1 text-xs text-muted-foreground">{t('videoHelper')}</p>
        {errors.videoUrl ? (
          <p className="mt-1 text-xs font-semibold text-primary">{errors.videoUrl.message}</p>
        ) : null}
      </div>

      {submitError ? (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-primary">{submitError}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        aria-label={submitting ? t('submitting') : t('submit')}
      >
        {submitting ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
