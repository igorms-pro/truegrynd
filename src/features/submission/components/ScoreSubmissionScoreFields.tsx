'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import type { ScoreSubmissionFormValues } from '@/features/submission/lib/scoreSubmissionSchema';
import type { ScoreType } from '@/lib/types/database.types';

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring font-mono tabular-nums';

type Props = {
  scoreType: ScoreType;
  register: UseFormRegister<ScoreSubmissionFormValues>;
  errors: FieldErrors<ScoreSubmissionFormValues>;
};

export function ScoreSubmissionScoreFields({ scoreType, register, errors }: Props) {
  const t = useTranslations('submission');
  const scoreLabel = scoreType === 'time' ? t('yourScoreTime') : t('yourScoreReps');

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {scoreLabel}
      </p>

      {scoreType === 'time' ? (
        <div>
          <input
            {...register('time')}
            placeholder={t('timePlaceholder')}
            inputMode="numeric"
            className={inputClassName}
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
            min={0}
            className={inputClassName}
            aria-invalid={!!errors.reps}
          />
          {errors.reps ? (
            <p className="mt-1 text-xs font-semibold text-primary">{errors.reps.message}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
