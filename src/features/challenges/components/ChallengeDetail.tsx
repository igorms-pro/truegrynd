'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import { formatTime } from '@/features/challenges/lib/scoreFormat';
import { useChallenge } from '@/features/challenges/hooks/useChallenge';

type Props = {
  challengeId: string;
};

function BackLink() {
  const locale = useLocale();
  const t = useTranslations('challenge');
  return (
    <Link
      href={`/${locale}/app/arena`}
      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t('back')}
    </Link>
  );
}

function NotFound() {
  const t = useTranslations('challenge');
  return (
    <section className="space-y-3">
      <BackLink />
      <h1 className="text-2xl font-black uppercase tracking-tight">{t('notFoundTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('notFoundBody')}</p>
    </section>
  );
}

export function ChallengeDetail({ challengeId }: Props) {
  const t = useTranslations('challenge');
  const tArena = useTranslations('arena');
  const locale = useLocale();
  const { data: challenge, loading, error } = useChallenge(challengeId);

  if (loading) {
    return (
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (error || !challenge) return <NotFound />;

  const isApproved = challenge.status === 'approved';

  return (
    <section className="space-y-6">
      <BackLink />

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {tArena(`scoreType.${challenge.score_type}`)}
          </span>
          {challenge.is_official ? (
            <span className="inline-flex items-center rounded-sm bg-primary/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              {tArena('officialBadge')}
            </span>
          ) : null}
          {!challenge.is_official && isApproved ? (
            <span className="inline-flex items-center rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              {tArena('badges.community')}
            </span>
          ) : null}
          {challenge.status === 'pending' ? (
            <span className="inline-flex items-center rounded-sm border border-accent/40 bg-accent/15 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-accent">
              {tArena('badges.pendingReview')}
            </span>
          ) : null}
          {challenge.status === 'rejected' ? (
            <span className="inline-flex items-center rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              {tArena('badges.rejected')}
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {challenge.title}
        </h1>
        <p className="text-sm text-foreground/80">{challenge.description}</p>
        {isApproved &&
        challenge.score_type === 'time' &&
        challenge.max_duration_seconds != null &&
        challenge.max_duration_seconds > 0 ? (
          <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">
            {t('maxTimeCap', { cap: formatTime(challenge.max_duration_seconds) })}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="space-y-2 rounded-md border border-border bg-card p-4">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('rulesHeading')}
          </h2>
          <p className="whitespace-pre-line text-sm text-foreground/90">{challenge.rules}</p>
        </article>

        <article className="space-y-2 rounded-md border border-border bg-card p-4">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('equipmentHeading')}
          </h2>
          {challenge.equipment_tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {challenge.equipment_tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t('noEquipment')}</p>
          )}
        </article>
      </div>

      {isApproved ? (
        <div className="rounded-md border border-border bg-card p-4">
          <Link
            href={`/${locale}/app/arena/${challenge.id}/submit`}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('ctaStart')}
          </Link>
        </div>
      ) : (
        <div
          className={
            challenge.status === 'rejected'
              ? 'rounded-md border border-primary/30 bg-primary/10 p-4'
              : 'rounded-md border border-accent/30 bg-accent/10 p-4'
          }
        >
          <p
            className={
              challenge.status === 'rejected'
                ? 'text-xs font-black uppercase tracking-[0.18em] text-primary'
                : 'text-xs font-black uppercase tracking-[0.18em] text-accent'
            }
          >
            {challenge.status === 'rejected' ? t('rejectedTitle') : t('pendingTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {challenge.status === 'rejected' ? t('rejectedBody') : t('pendingBody')}
          </p>
          {challenge.status === 'rejected' && challenge.rejection_reason?.trim() ? (
            <p className="mt-3 whitespace-pre-line rounded-sm border border-border bg-background/60 p-3 text-sm text-foreground/90">
              {t('rejectionModeratorNote', { note: challenge.rejection_reason.trim() })}
            </p>
          ) : null}
        </div>
      )}

      {isApproved ? (
        <Leaderboard challengeId={challenge.id} scoreType={challenge.score_type} />
      ) : null}
    </section>
  );
}
