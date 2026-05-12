'use client';

import { useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import type { CreateChallengeFormValues } from '@/features/challenges/lib/createChallengeSchema';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs font-semibold text-primary" role="alert">
      {message}
    </p>
  );
}

export function CreateChallengeScoringSection({ disabled }: { disabled: boolean }) {
  const t = useTranslations('arena.create');
  const { control, register, setValue, formState } = useFormContext<CreateChallengeFormValues>();
  const scoringMode = useWatch({ control, name: 'scoringMode' }) ?? 'for_time';

  const modeBtnClass = (mode: 'for_time' | 'amrap') =>
    [
      'flex-1 rounded-sm border px-3 py-3 text-center text-xs font-black uppercase tracking-[0.14em] transition-colors',
      scoringMode === mode
        ? 'border-primary bg-primary/15 text-primary'
        : 'border-border bg-background text-muted-foreground hover:text-foreground',
    ].join(' ');

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('scoring.legend')}
      </legend>
      <p className="text-xs text-muted-foreground">{t('scoring.helper')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className={modeBtnClass('for_time')}
          disabled={disabled}
          onClick={() => {
            setValue('scoringMode', 'for_time', { shouldValidate: true });
            setValue('amrapCap', '', { shouldValidate: true });
          }}
        >
          {t('scoring.forTime')}
        </button>
        <button
          type="button"
          className={modeBtnClass('amrap')}
          disabled={disabled}
          onClick={() => {
            setValue('scoringMode', 'amrap', { shouldValidate: true });
            setValue('forTimeCap', '', { shouldValidate: true });
          }}
        >
          {t('scoring.amrap')}
        </button>
      </div>
      <input type="hidden" {...register('scoringMode')} />

      {scoringMode === 'for_time' ? (
        <div className="pt-2">
          <label
            htmlFor="cc-for-time-cap"
            className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t('scoring.forTimeCapLabel')}
          </label>
          <input
            id="cc-for-time-cap"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder={t('scoring.forTimeCapPlaceholder')}
            className="mt-2 w-full max-w-[10rem] rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('forTimeCap')}
          />
          <p className="mt-1 text-[10px] text-muted-foreground">{t('scoring.forTimeCapHint')}</p>
          <FieldError message={formState.errors.forTimeCap?.message} />
        </div>
      ) : null}

      {scoringMode === 'amrap' ? (
        <div className="pt-2">
          <label
            htmlFor="cc-amrap-cap"
            className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground"
          >
            {t('scoring.amrapCapLabel')}
          </label>
          <input
            id="cc-amrap-cap"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            disabled={disabled}
            placeholder={t('scoring.amrapCapPlaceholder')}
            className="mt-2 w-full max-w-[10rem] rounded-sm border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('amrapCap')}
          />
          <FieldError message={formState.errors.amrapCap?.message} />
        </div>
      ) : null}
    </fieldset>
  );
}
