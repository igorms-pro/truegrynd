'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Swords, Timer, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatTime } from '@/features/challenges/lib/scoreFormat';
import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenge: Challenge;
  locale: string;
  isApproved: boolean;
};

function DetailBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'muted' | 'primary' | 'accent' | 'community';
}) {
  const tones = {
    muted: 'border-border bg-muted text-muted-foreground',
    primary: 'border-primary/50 bg-primary/15 text-primary',
    accent: 'border-accent/50 bg-accent/15 text-accent',
    community: 'border-border bg-background text-muted-foreground',
  };
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
        tones[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}

export function ChallengeDetailHero({ challenge, locale, isApproved }: Props) {
  const t = useTranslations('challenge');
  const tArena = useTranslations('arena');

  const kickerKey =
    challenge.status === 'rejected'
      ? 'heroKickerRejected'
      : challenge.status === 'pending'
        ? 'heroKickerPending'
        : 'heroKickerApproved';

  const ScoreIcon = challenge.score_type === 'time' ? Timer : Trophy;

  return (
    <header className="relative overflow-hidden rounded-md border border-border bg-card">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(220,38,38,0.22)_0%,transparent_45%,rgba(255,184,0,0.12)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />

      <div className="relative space-y-3 py-4 pl-5 pr-4 md:py-5">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">
          {t(kickerKey)}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <DetailBadge tone="muted">
            <ScoreIcon className="h-3 w-3" aria-hidden />
            {tArena(`scoreType.${challenge.score_type}`)}
          </DetailBadge>
          {challenge.is_official ? (
            <DetailBadge tone="primary">{tArena('officialBadge')}</DetailBadge>
          ) : null}
          {!challenge.is_official && isApproved ? (
            <DetailBadge tone="community">{tArena('badges.community')}</DetailBadge>
          ) : null}
          {challenge.status === 'pending' ? (
            <DetailBadge tone="accent">{tArena('badges.pendingReview')}</DetailBadge>
          ) : null}
          {challenge.status === 'rejected' ? (
            <DetailBadge tone="primary">{tArena('badges.rejected')}</DetailBadge>
          ) : null}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase leading-[0.95] tracking-tight text-foreground md:text-3xl">
            {challenge.title}
          </h1>
          {challenge.description.trim().length > 0 ? (
            <p className="max-w-2xl text-sm leading-snug text-foreground/85">
              {challenge.description}
            </p>
          ) : null}
          {isApproved &&
          challenge.score_type === 'time' &&
          challenge.max_duration_seconds != null &&
          challenge.max_duration_seconds > 0 ? (
            <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">
              {t('maxTimeCap', { cap: formatTime(challenge.max_duration_seconds) })}
            </p>
          ) : null}
        </div>

        {isApproved ? (
          <div className="space-y-2 pt-1">
            <Link
              href={`/${locale}/app/arena/${challenge.id}/submit`}
              className="inline-flex w-full min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_32px_rgba(220,38,38,0.35)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:w-auto md:min-w-[16rem]"
            >
              <Swords className="h-4 w-4" aria-hidden />
              {t('ctaStart')}
            </Link>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              {t('ctaSubline')}
            </p>
          </div>
        ) : null}
      </div>
    </header>
  );
}
