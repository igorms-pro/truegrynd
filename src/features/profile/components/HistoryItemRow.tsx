'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { formatScore } from '@/features/challenges/lib/scoreFormat';
import { HistoryScoreActions } from '@/features/profile/components/HistoryScoreActions';
import type { HistoryItem } from '@/features/profile/types';

type BadgeTone = 'ranked' | 'saved' | 'in_progress' | 'won';

function StatusBadge({ children, tone }: { children: string; tone: BadgeTone }) {
  const tones: Record<BadgeTone, string> = {
    ranked: 'border-primary bg-primary/10 text-primary',
    saved: 'border-border bg-muted text-muted-foreground',
    in_progress: 'border-accent/50 bg-accent/15 text-accent',
    won: 'border-accent bg-accent/20 text-accent',
  };

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}

type Props = {
  item: HistoryItem;
  userId: string | null;
  onScoreChanged: () => void;
};

export function HistoryItemRow({ item, userId, onScoreChanged }: Props) {
  const t = useTranslations('profile.historyPage');
  const locale = useLocale();

  if (item.kind === 'in_progress') {
    const submitHref = `/${locale}/app/arena/${item.challengeId}/submit`;

    return (
      <div className="rounded-sm border border-border bg-background p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase tracking-tight">
              {item.challengeTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(item.committedAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge tone="in_progress">{t('badges.inProgress')}</StatusBadge>
        </div>

        <div className="mt-3 flex justify-end">
          <Link
            href={submitHref}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('actions.submit')}
          </Link>
        </div>
      </div>
    );
  }

  const scoreLabel = item.isValidated ? t('badges.ranked') : t('badges.saved');
  const badgeTone = item.isValidated ? 'ranked' : 'saved';
  const toFinisher = `/${locale}/app/finish?challengeId=${item.challengeId}&ranked=${String(
    item.isValidated,
  )}&scoreId=${encodeURIComponent(item.id)}`;
  const formattedScore = formatScore(item.value, item.scoreType);

  return (
    <div className="rounded-sm border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black uppercase tracking-tight">
            {item.challengeTitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formattedScore} · {new Date(item.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge tone={badgeTone}>{scoreLabel}</StatusBadge>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {item.videoUrl ? (
          <a
            href={item.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-muted px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('actions.proof')}
          </a>
        ) : null}
        <Link
          href={toFinisher}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('actions.card')}
        </Link>
        {userId ? (
          <HistoryScoreActions
            scoreId={item.id}
            userId={userId}
            currentVideoUrl={item.videoUrl}
            onChanged={onScoreChanged}
          />
        ) : null}
      </div>
    </div>
  );
}
