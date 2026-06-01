'use client';

import { useTranslations } from 'next-intl';

import { getDivisionBadgeClasses } from '@/lib/divisions';
import type { Division } from '@/lib/types/database.types';

type Props = {
  division: Division;
  className?: string;
};

export function DivisionBadge({ division, className = '' }: Props) {
  const t = useTranslations('divisions');
  const badge = getDivisionBadgeClasses(division);

  return (
    <span
      className={[
        'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
        badge.bg,
        badge.text,
        badge.border,
        className,
      ].join(' ')}
    >
      {t(division)}
    </span>
  );
}
