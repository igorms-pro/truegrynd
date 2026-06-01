'use client';

import { useTranslations } from 'next-intl';

import type { ProofLevel } from '@/lib/types/database.types';

type Props = {
  level: ProofLevel;
  compact?: boolean;
  className?: string;
};

const TONE: Record<ProofLevel, string> = {
  honor: 'border-border bg-muted text-muted-foreground',
  video_ranked: 'border-primary/40 bg-primary/10 text-primary',
  community_verified: 'border-accent/50 bg-accent/15 text-accent',
  event_verified: 'border-accent bg-accent/25 text-accent',
  judge_verified: 'border-emerald-600/50 bg-emerald-950/40 text-emerald-400',
};

export function ProofLevelBadge({ level, compact = false, className = '' }: Props) {
  const t = useTranslations('proof.levels');
  const labelKey = compact ? `${level}Short` : level;

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded-sm border font-black uppercase tracking-[0.16em]',
        compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
        TONE[level],
        className,
      ].join(' ')}
      title={t(level)}
    >
      {t(labelKey)}
    </span>
  );
}
