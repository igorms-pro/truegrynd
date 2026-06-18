'use client';

import { useLocale, useTranslations } from 'next-intl';

import { SecondaryButtonLink } from '@/components/ButtonLink';
import { factionPath } from '@/features/factions/lib/factionSlug';
import {
  resolveWeeklyDisplayLabel,
  useWeeklyChallenge,
} from '@/features/overview/hooks/useWeeklyChallenge';
import { OverviewFactionCard } from '@/features/overview/components/OverviewFactionCard';
import { OverviewHeroCard } from '@/features/overview/components/OverviewHeroCard';
import { EventCard } from '@/features/events/components/EventCard';
import { useActiveEvents } from '@/features/events/hooks/useActiveEvents';
import { ComebackWeekBanner } from '@/features/growth/components/ComebackWeekBanner';
import { WeeklyChallengeInvite } from '@/features/growth/components/WeeklyChallengeInvite';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { useProfileRating } from '@/features/profile/hooks/useProfileRating';
import { getComebackEligibility } from '@/lib/growth/comebackWeek';
import { getWeeklyTimeRemaining } from '@/lib/weekly';

export function OverviewScreen() {
  const locale = useLocale();
  const tApp = useTranslations('app');
  const t = useTranslations('overview');
  const tWeekly = useTranslations('weekly');

  const { state: weeklyState } = useWeeklyChallenge();
  const { state: eventsState } = useActiveEvents();
  const appProfile = useOptionalAppProfile();
  const { state: ratingState } = useProfileRating(appProfile?.id ?? null);

  const clanHref = `/${locale}/app/clan`;
  const readyProfile = appProfile;
  const userFaction = readyProfile?.faction ?? null;
  const factionHref = userFaction ? factionPath(locale, userFaction) : clanHref;

  const weekly = weeklyState.status === 'ready' ? weeklyState.weekly : null;
  const weeklyLabel = weekly ? resolveWeeklyDisplayLabel(weekly) : null;
  const weeklyRemaining = weekly ? getWeeklyTimeRemaining(new Date(weekly.ends_at)) : null;
  const comeback = readyProfile
    ? getComebackEligibility(readyProfile.last_activity_at)
    : { eligible: false, weeksAway: null };
  const showComeback = comeback.eligible && comeback.weeksAway !== null;
  const hasComebackEvent =
    eventsState.status === 'ready' &&
    eventsState.events.some((event) => event.event_type === 'comeback_week');
  const userDivision = readyProfile?.division ?? null;

  // Exactly one red CTA on screen: when the comeback banner owns the primary
  // action, the hero CTA drops to a secondary style.
  const hasWeekly = Boolean(weekly);
  const primaryHref = hasWeekly
    ? `/${locale}/app/arena/${weekly!.challenge.id}/submit`
    : `/${locale}/app/arena`;
  const primaryLabel = hasWeekly ? t('heroPrimaryWeekly') : t('ctaArena');
  const ratingValue =
    ratingState.status === 'ready' && ratingState.rating
      ? Math.round(ratingState.rating.global)
      : null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {tApp('overviewTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{tApp('overviewBody')}</p>
      </header>

      {showComeback ? (
        <ComebackWeekBanner
          weeksAway={comeback.weeksAway as number}
          weeklyChallengeId={weekly?.challenge.id ?? null}
          hasComebackEvent={hasComebackEvent}
        />
      ) : null}

      {readyProfile ? (
        <OverviewHeroCard
          username={readyProfile.username}
          division={readyProfile.division}
          faction={userFaction}
          streakDays={readyProfile.streak_days}
          ratingValue={ratingValue}
          primaryHref={primaryHref}
          primaryLabel={primaryLabel}
          primaryAsSecondary={showComeback}
        />
      ) : (
        <article className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </article>
      )}

      {/* CONTENT ROW — faction standing + weekly (quiet, tappable) */}
      <div className="grid gap-4 md:grid-cols-2">
        {userFaction ? (
          <OverviewFactionCard href={factionHref} userFaction={userFaction} />
        ) : (
          <article className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              {t('factionStandingTitle')}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">{t('noFactionBody')}</p>
            <div className="mt-4">
              <SecondaryButtonLink href={`/${locale}/app/onboarding`} label={t('noFactionCta')} />
            </div>
          </article>
        )}

        <article className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            {t('weeklyTitle')}
          </p>

          {weeklyState.status === 'loading' ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
          ) : null}

          {weeklyState.status === 'ready' && weekly ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  {weeklyLabel}
                </p>
                <p className="mt-2 text-lg font-black uppercase tracking-tight">
                  {weekly.challenge.title}
                </p>
                {weeklyRemaining ? (
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-accent">
                    {tWeekly('endsIn', {
                      days: weeklyRemaining.days,
                      hours: weeklyRemaining.hours,
                    })}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">{tWeekly('ended')}</p>
                )}
              </div>
              <SecondaryButtonLink
                href={`/${locale}/app/arena/${weekly.challenge.id}`}
                label={t('ctaGo')}
              />
              {userFaction && userDivision && weeklyLabel ? (
                <WeeklyChallengeInvite
                  challengeId={weekly.challenge.id}
                  faction={userFaction}
                  division={userDivision}
                  weeklyLabel={weeklyLabel}
                />
              ) : null}
            </div>
          ) : null}

          {weeklyState.status === 'ready' && !weekly ? (
            <p className="mt-3 text-sm text-muted-foreground">{t('weeklyEmpty')}</p>
          ) : null}
        </article>
      </div>

      {/* Events — quiet; CTA only when there is something to see */}
      <article className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
          {t('eventsTitle')}
        </p>
        {eventsState.status === 'loading' ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
        ) : null}
        {eventsState.status === 'ready' && eventsState.events.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t('eventsEmpty')}</p>
        ) : null}
        {eventsState.status === 'ready' && eventsState.events.length > 0 ? (
          <>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {eventsState.events.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-4">
              <SecondaryButtonLink href={`/${locale}/app/events`} label={t('eventsCta')} />
            </div>
          </>
        ) : null}
      </article>
    </section>
  );
}
