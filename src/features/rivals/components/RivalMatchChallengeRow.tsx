'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { formatScore } from '@/features/challenges/lib/scoreFormat';
import type { RivalChallengeScoresView } from '@/features/rivals/services/rivalMatches';

type Props = {
  challenge: RivalChallengeScoresView;
  locale: string;
  currentUserId: string | null;
  canSubmit: boolean;
};

export function RivalMatchChallengeRow({ challenge, locale, currentUserId, canSubmit }: Props) {
  const t = useTranslations('rivals.detail');

  return (
    <article className="rounded-sm border border-border bg-card p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            {t('challengeLabel', { order: challenge.sortOrder })}
          </p>
          <h3 className="mt-1 text-sm font-black uppercase tracking-tight">{challenge.title}</h3>
        </div>
        {canSubmit && currentUserId ? (
          <Link
            href={`/${locale}/app/arena/${challenge.challengeId}/submit`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90"
          >
            {t('submitCta')}
          </Link>
        ) : null}
      </header>

      <ul className="mt-4 space-y-2">
        {challenge.participantScores.map((entry) => {
          const isRoundWinner = challenge.roundWinnerId === entry.userId;
          const isSelf = entry.userId === currentUserId;
          const formatted =
            entry.value !== null ? formatScore(entry.value, challenge.scoreType) : t('noScore');

          return (
            <li
              key={entry.userId}
              className={`flex items-center justify-between gap-3 rounded-sm border px-3 py-2 ${
                isRoundWinner ? 'border-accent/50 bg-accent/10' : 'border-border bg-muted/30'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                {isSelf ? t('you') : `@${entry.username ?? t('unknown')}`}
              </span>
              <span className="font-mono text-sm font-black tabular-nums text-foreground">
                {formatted}
                {isRoundWinner ? (
                  <span className="ml-2 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
                    {t('roundWin')}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
