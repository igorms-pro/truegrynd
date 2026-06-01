'use client';

import { useLocale, useTranslations } from 'next-intl';

import { RivalMatchBackLink } from '@/features/rivals/components/RivalMatchBackLink';
import { RivalMatchChallengeRow } from '@/features/rivals/components/RivalMatchChallengeRow';
import { useNowTick } from '@/features/rivals/hooks/useNowTick';
import { useRivalMatch } from '@/features/rivals/hooks/useRivalMatch';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { getWeeklyTimeRemaining, isWeeklyWindowLive } from '@/lib/weekly';

type Props = {
  matchId: string;
};

export function RivalMatchDetailScreen({ matchId }: Props) {
  const t = useTranslations('rivals.detail');
  const tStatus = useTranslations('rivals.status');
  const tDivisions = useTranslations('divisions');
  const locale = useLocale();
  const profileState = useProfile();
  const { state, refetch } = useRivalMatch(matchId);

  const currentUserId =
    profileState.state.status === 'ready' ? profileState.state.profile.id : null;

  const match = state.status === 'ready' ? state.match : null;
  const detail = state.status === 'ready' ? state.detail : null;
  const isActive = match?.status === 'active';
  const endsAt = match?.endsAt ?? null;
  const startsAt = match?.startsAt ?? null;
  const now = useNowTick(isActive);

  const timeRemaining = endsAt && isActive ? getWeeklyTimeRemaining(new Date(endsAt), now) : null;

  const isAcceptedParticipant =
    currentUserId !== null &&
    (match?.participants.some((p) => p.userId === currentUserId && p.status === 'accepted') ??
      false);

  const canSubmit =
    match?.status === 'active' &&
    startsAt !== null &&
    endsAt !== null &&
    isAcceptedParticipant &&
    isWeeklyWindowLive(new Date(startsAt), new Date(endsAt), now);

  if (profileState.state.status === 'loading' || state.status === 'loading') {
    return (
      <section className="space-y-4">
        <RivalMatchBackLink locale={locale} label={t('back')} />
        <p className="text-sm text-muted-foreground" role="status">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (state.status === 'error' || profileState.state.status === 'error') {
    return (
      <section className="space-y-4">
        <RivalMatchBackLink locale={locale} label={t('back')} />
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground"
          >
            {t('retry')}
          </button>
        </div>
      </section>
    );
  }

  if (!match) {
    return (
      <section className="space-y-4">
        <RivalMatchBackLink locale={locale} label={t('back')} />
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('notFoundTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFoundBody')}</p>
      </section>
    );
  }

  const acceptedParticipants = match.participants.filter((p) => p.status === 'accepted');
  const winnerUsername = match.winnerId
    ? (match.participants.find((p) => p.userId === match.winnerId)?.username ?? t('unknown'))
    : null;

  return (
    <section className="space-y-6">
      <RivalMatchBackLink locale={locale} label={t('back')} />

      <header className="space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {tStatus(match.status)}
        </p>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {t('meta', {
            division: tDivisions(match.division),
            duration: match.durationHours === 24 ? t('duration24') : t('duration7d'),
          })}
        </p>
        {isActive && timeRemaining ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t('endsIn', { days: timeRemaining.days, hours: timeRemaining.hours })}
          </p>
        ) : null}
        {isActive && !timeRemaining ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t('windowEnded')}
          </p>
        ) : null}
        {match.status === 'pending' ? (
          <p className="text-sm text-muted-foreground">{t('pendingHint')}</p>
        ) : null}
      </header>

      <section className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('participantsTitle')}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {acceptedParticipants.map((p) => (
            <li
              key={p.userId}
              className="rounded-sm border border-border bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              {p.userId === currentUserId ? t('you') : `@${p.username ?? t('unknown')}`}
            </li>
          ))}
        </ul>
      </section>

      {match.winnerId ? (
        <p className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm font-black uppercase tracking-tight text-accent">
          {t('winner', { username: winnerUsername ?? t('unknown') })}
        </p>
      ) : null}

      {!match.winnerId && detail?.winnerResult.reason === 'tie' ? (
        <p className="text-sm text-muted-foreground">{t('tie')}</p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('challengesTitle')}
        </h2>
        {detail?.challengeScores.length ? (
          <ul className="space-y-3">
            {detail.challengeScores.map((challenge) => (
              <li key={challenge.challengeId}>
                <RivalMatchChallengeRow
                  challenge={challenge}
                  locale={locale}
                  currentUserId={currentUserId}
                  canSubmit={canSubmit}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {match.challenges.map((challenge) => (
              <li
                key={challenge.challengeId}
                className="rounded-sm border border-border bg-card px-4 py-3 text-sm font-black uppercase tracking-tight"
              >
                {challenge.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      {isActive ? (
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground" role="status">
          {t('pollingHint')}
        </p>
      ) : null}
    </section>
  );
}
