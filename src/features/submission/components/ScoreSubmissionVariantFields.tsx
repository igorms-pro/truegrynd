'use client';

import { useTranslations } from 'next-intl';

import type { ChallengeVariant } from '@/lib/types/database.types';

type Props = {
  variants: readonly ChallengeVariant[];
  value: ChallengeVariant;
  disabled?: boolean;
  onChange: (next: ChallengeVariant) => void;
};

function chipClass(active: boolean): string {
  return [
    'rounded-sm border px-2 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
    active
      ? 'border-primary bg-primary/15 text-primary'
      : 'border-border bg-background text-muted-foreground hover:text-foreground',
  ].join(' ');
}

export function ScoreSubmissionVariantFields({
  variants,
  value,
  disabled = false,
  onChange,
}: Props) {
  const t = useTranslations('submission');
  const tVariants = useTranslations('variants');

  if (variants.length <= 1) return null;

  return (
    <fieldset className="space-y-2 rounded-md border border-border bg-card p-4" disabled={disabled}>
      <legend className="px-1 text-xs font-black uppercase tracking-[0.18em] text-foreground">
        {t('variantTitle')}
      </legend>
      <p className="text-xs text-muted-foreground">{t('variantBody')}</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant}
            type="button"
            aria-pressed={value === variant}
            disabled={disabled}
            onClick={() => onChange(variant)}
            className={chipClass(value === variant)}
          >
            {tVariants(variant)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
