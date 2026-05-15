'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  scoreId: string;
  /** ID of the score owner — if same as current user, button is hidden. */
  scoreUserId: string;
  currentUserId: string | null;
  count: number;
  respected: boolean;
  disabled: boolean;
  onToggle: (scoreId: string) => Promise<void>;
};

export function RespectButton({
  scoreId,
  scoreUserId,
  currentUserId,
  count,
  respected,
  disabled,
  onToggle,
}: Props) {
  const t = useTranslations('leaderboard.respect');

  const handleClick = useCallback(() => {
    void onToggle(scoreId);
  }, [onToggle, scoreId]);

  if (currentUserId && currentUserId === scoreUserId) {
    return null;
  }

  const label = respected ? t('undo') : t('give');

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || !currentUserId}
      aria-label={t('aria', { count })}
      className={[
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
        respected
          ? 'border-primary/40 bg-primary/15 text-primary'
          : 'border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/30',
      ].join(' ')}
    >
      <span aria-hidden>👊</span>
      <span className="tabular-nums">{count > 0 ? count : ''}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}
