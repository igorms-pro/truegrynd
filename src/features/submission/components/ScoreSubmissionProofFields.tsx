'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import type { ScoreSubmissionFormValues } from '@/features/submission/lib/scoreSubmissionSchema';

const inputClassName =
  'mt-2 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring';

type Props = {
  register: UseFormRegister<ScoreSubmissionFormValues>;
  errors: FieldErrors<ScoreSubmissionFormValues>;
};

export function ScoreSubmissionProofFields({ register, errors }: Props) {
  const t = useTranslations('submission');

  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('proofTitle')}
      </p>
      <p className="text-sm text-muted-foreground">{t('proofBody')}</p>

      <label className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('videoLabelOptional')}
      </label>
      <input
        {...register('videoUrl')}
        className={inputClassName}
        placeholder="youtube.com/watch?v=..."
        aria-invalid={!!errors.videoUrl}
      />
      <p className="mt-1 text-xs text-muted-foreground">{t('videoHelper')}</p>
      {errors.videoUrl ? (
        <p className="mt-1 text-xs font-semibold text-primary">{errors.videoUrl.message}</p>
      ) : null}
    </div>
  );
}
