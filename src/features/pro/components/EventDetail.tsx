'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import { getGymEvent, type GymEvent } from '@/features/pro/services/events';
import { ScoreSubmissionForm } from '@/features/submission/components/ScoreSubmissionForm';
import { useAsyncResource } from '@/hooks/useAsyncResource';

type Phase = 'upcoming' | 'live' | 'ended';

function phaseOf(event: GymEvent): Phase {
  const now = Date.now();
  if (now < new Date(event.startsAt).getTime()) return 'upcoming';
  if (now > new Date(event.endsAt).getTime()) return 'ended';
  return 'live';
}

function EventBody({ event }: { event: GymEvent }) {
  const t = useTranslations('pro.events');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const phase = phaseOf(event);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [done, setDone] = useState(false);

  const formatWindow = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/app/pro/events`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('detail.back')}
      </Link>

      <header className="space-y-2">
        <span className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t(`phase.${phase}`)}
        </span>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{event.title}</h1>
        <p className="text-sm text-muted-foreground">
          {formatWindow(event.startsAt)} → {formatWindow(event.endsAt)}
        </p>
      </header>

      {event.description ? (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      ) : null}

      {event.workout ? (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('detail.workout')}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-foreground">
            {event.workout}
          </pre>
        </div>
      ) : null}

      {/* Score submission flows through the same core pipeline as the B2C arena. */}
      {phase === 'live' && event.challengeId ? (
        done ? (
          <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            {t('detail.submitted')}
          </p>
        ) : submitting ? (
          <div className="rounded-md border border-border bg-card p-4">
            <ScoreSubmissionForm
              challengeId={event.challengeId}
              scoreType={event.scoreType}
              availableVariants={['standard']}
              onSubmitted={() => {
                setSubmitting(false);
                setDone(true);
                setReloadKey((k) => k + 1);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitting(true)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('detail.submit')}
          </button>
        )
      ) : null}

      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('detail.standings')}
        </h2>
        {event.challengeId ? (
          <Leaderboard
            key={`${event.challengeId}-${reloadKey}-${profile?.id ?? ''}`}
            challengeId={event.challengeId}
            scoreType={event.scoreType}
            availableVariants={['standard']}
            mode="full"
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('detail.noStandings')}</p>
        )}
      </div>
    </section>
  );
}

export function EventDetail({ eventId }: { eventId: string }) {
  const t = useTranslations('pro.events');
  const load = useCallback(() => getGymEvent(eventId), [eventId]);
  const { state } = useAsyncResource(load, [eventId]);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error' || !state.data) {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }
  return <EventBody event={state.data} />;
}
