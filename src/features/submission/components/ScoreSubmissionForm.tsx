'use client';

import { useCallback, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';

import { useRequireAppAccess } from '@/features/appshell';
import { ScoreSubmissionProofFields } from '@/features/submission/components/ScoreSubmissionProofFields';
import { ScoreSubmissionScoreFields } from '@/features/submission/components/ScoreSubmissionScoreFields';
import {
  buildScoreSubmissionSchema,
  parseScoreSubmissionValue,
  type ScoreSubmissionFormValues,
} from '@/features/submission/lib/scoreSubmissionSchema';
import { submitScore, SUBMISSION_ERRORS } from '@/features/submission/services/submitScore';
import type { ScoreType } from '@/lib/types/database.types';

type Props = {
  challengeId: string;
  scoreType: ScoreType;
  maxDurationSeconds?: number | null;
  onSubmitted: (result: { ranked: boolean; insertedId: string }) => void;
};

export function ScoreSubmissionForm({
  challengeId,
  scoreType,
  maxDurationSeconds = null,
  onSubmitted,
}: Props) {
  const t = useTranslations('submission');
  const access = useRequireAppAccess();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () => buildScoreSubmissionSchema((k) => t(k), scoreType, maxDurationSeconds ?? null),
    [t, scoreType, maxDurationSeconds],
  );

  const form = useForm<ScoreSubmissionFormValues>({
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

  const onSubmit: SubmitHandler<ScoreSubmissionFormValues> = useCallback(
    async (values) => {
      if (access.status !== 'ready') return;
      setSubmitting(true);
      setSubmitError(null);

      const value = parseScoreSubmissionValue(values, scoreType);
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
        onSubmitted({ ranked: res.ranked, insertedId: res.insertedId });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (message === SUBMISSION_ERRORS.VIDEO_INVALID) {
          setError('videoUrl', { type: 'validate', message: t('errors.videoInvalid') });
          return;
        }
        if (message === SUBMISSION_ERRORS.EXCEEDS_TIME_CAP) {
          setError('time', { type: 'validate', message: t('errors.exceedsTimeCap') });
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ScoreSubmissionScoreFields scoreType={scoreType} register={register} errors={errors} />
      <ScoreSubmissionProofFields register={register} errors={errors} />

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
