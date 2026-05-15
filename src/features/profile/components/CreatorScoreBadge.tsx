'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  creatorTier,
  nextTierThreshold,
  type CreatorTier,
} from '@/features/profile/lib/creatorBadge';

const TIER_STYLES: Record<CreatorTier, string> = {
  none: 'border-border bg-muted text-muted-foreground',
  bronze: 'border-amber-700/40 bg-amber-900/15 text-amber-500',
  silver: 'border-slate-400/40 bg-slate-500/15 text-slate-300',
  gold: 'border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent)]',
};

type Props = {
  score: number;
};

export function CreatorScoreBadge({ score }: Props) {
  const t = useTranslations('profile.creatorScore');
  const [showTooltip, setShowTooltip] = useState(false);

  const tier = creatorTier(score);
  const next = nextTierThreshold(score);
  const tierLabel = tier === 'none' ? '' : ` · ${t(`tiers.${tier}`)}`;

  const toggleTooltip = useCallback(() => {
    setShowTooltip((prev) => !prev);
  }, []);

  const closeTooltip = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleTooltip}
        onBlur={closeTooltip}
        className={[
          'inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] transition-colors',
          TIER_STYLES[tier],
        ].join(' ')}
        aria-label={t('aria', { score })}
      >
        <span className="font-variant-numeric tabular-nums">{score}</span>
        <span>
          {t('label')}
          {tierLabel}
        </span>
      </button>
      {showTooltip ? (
        <span
          role="tooltip"
          className="absolute top-full left-0 z-30 mt-2 w-56 rounded-sm border border-border bg-card p-3 text-[11px] leading-relaxed text-muted-foreground shadow-lg"
        >
          <span className="block font-black uppercase tracking-[0.14em] text-foreground">
            {t('tooltipTitle')}
          </span>
          {t('tooltipBody')}
          {next ? (
            <span className="mt-1.5 block text-[10px]">{t('nextTier', { threshold: next })}</span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
