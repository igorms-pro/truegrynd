'use client';

import { useTranslations } from 'next-intl';

import type { ChallengeVariant } from '@/lib/types/database.types';

type Props = {
  variants: readonly ChallengeVariant[];
  className?: string;
};

export function ChallengeVariantBadges({ variants, className = '' }: Props) {
  const t = useTranslations('variants');

  if (variants.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {variants.map((variant) => (
        <li
          key={variant}
          className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
        >
          {t(variant)}
        </li>
      ))}
    </ul>
  );
}
