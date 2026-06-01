'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { CreateChallengeFormValues } from '@/features/challenges/lib/createChallengeSchema';
import { CHALLENGE_VARIANTS } from '@/lib/variants';
import type { ChallengeVariant } from '@/lib/types/database.types';

type Props = {
  disabled?: boolean;
};

function chipClass(active: boolean, disabled: boolean): string {
  return [
    'rounded-sm border px-2 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    active
      ? 'border-primary bg-primary/15 text-primary'
      : 'border-border bg-background text-muted-foreground hover:text-foreground',
  ].join(' ');
}

export function CreateChallengeVariantsSection({ disabled = false }: Props) {
  const t = useTranslations('arena.create');
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateChallengeFormValues>();

  const selected = watch('variants') ?? [];

  const toggle = (variant: ChallengeVariant): void => {
    if (disabled) return;
    const next = selected.includes(variant)
      ? selected.filter((v) => v !== variant)
      : [...selected, variant];
    setValue('variants', next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('fields.variants')}
      </legend>
      <p className="text-xs text-muted-foreground">{t('fields.variantsHint')}</p>
      <div className="flex flex-wrap gap-2">
        {CHALLENGE_VARIANTS.map((variant) => {
          const active = selected.includes(variant);
          return (
            <button
              key={variant}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => toggle(variant)}
              className={chipClass(active, disabled)}
            >
              {t(`variants.${variant}`)}
            </button>
          );
        })}
      </div>
      {errors.variants?.message ? (
        <p className="text-xs font-semibold text-primary" role="alert">
          {errors.variants.message}
        </p>
      ) : null}
    </fieldset>
  );
}
