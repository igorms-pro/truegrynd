'use client';

import { Flame } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { factionPath } from '@/features/factions/lib/factionSlug';
import {
  resolveWeeklyDisplayLabel,
  useWeeklyChallenge,
} from '@/features/overview/hooks/useWeeklyChallenge';
import { EventCard } from '@/features/events/components/EventCard';
import { useActiveEvents } from '@/features/events/hooks/useActiveEvents';
import { ComebackWeekBanner } from '@/features/growth/components/ComebackWeekBanner';
import { WeeklyChallengeInvite } from '@/features/growth/components/WeeklyChallengeInvite';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { getComebackEligibility } from '@/lib/growth/comebackWeek';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import { getWeeklyTimeRemaining } from '@/lib/weekly';

function PrimaryButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
    </Link>
  );
}

export function OverviewScreen() {
  const locale = useLocale();
  const tApp = useTranslations('app');
  const t = useTranslations('overview');
  const tWeekly = useTranslations('weekly');
  const tFactions = useTranslations('factions');

  const { state: weeklyState, refetch: refetchWeekly } = useWeeklyChallenge();
  const { state: eventsState } = useActiveEvents();
  const appProfile = useOptionalAppProfile();

  const clanHref = `/${locale}/app/clan`;
  const readyProfile = appProfile;
  const userFaction = readyProfile?.faction ?? null;
  const factionBadge = userFaction ? getFactionBadgeClasses(userFaction) : null;
  const factionName = userFaction ? tFactions(userFaction) : null;
  const factionHref = userFaction ? factionPath(locale, userFaction) : clanHref;

  const weekly = weeklyState.status === 'ready' ? weeklyState.weekly : null;
  const weeklyLabel = weekly ? resolveWeeklyDisplayLabel(weekly) : null;
  const weeklyRemaining = weekly ? getWeeklyTimeRemaining(new Date(weekly.ends_at)) : null;
  const comeback = readyProfile
    ? getComebackEligibility(readyProfile.last_activity_at)
    : { eligible: false, weeksAway: null };
  const hasComebackEvent =
    eventsState.status === 'ready' &&
    eventsState.events.some((event) => event.event_type === 'comeback_week');
  const siteFaction = userFaction;
  const userDivision = readyProfile?.division ?? null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {tApp('overviewTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{tApp('overviewBody')}</p>
      </header>

      {comeback.eligible && comeback.weeksAway !== null ? (
        <ComebackWeekBanner
          weeksAway={comeback.weeksAway}
          weeklyChallengeId={weekly?.challenge.id ?? null}
          hasComebackEvent={hasComebackEvent}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            {t('weeklyTitle')}
          </p>

          {weeklyState.status === 'loading' ? (
            <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
          ) : null}

          {weeklyState.status === 'error' ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">{t('error')}</p>
              <button
                type="button"
                onClick={refetchWeekly}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-muted px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('retry')}
              </button>
            </div>
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
                <p className="mt-1 text-sm text-muted-foreground">{weekly.challenge.description}</p>
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
              <PrimaryButtonLink
                href={`/${locale}/app/arena/${weekly.challenge.id}`}
                label={t('ctaGo')}
              />
              {siteFaction && userDivision && weeklyLabel ? (
                <WeeklyChallengeInvite
                  challengeId={weekly.challenge.id}
                  faction={siteFaction}
                  division={userDivision}
                  weeklyLabel={weeklyLabel}
                />
              ) : null}
            </div>
          ) : null}

          {weeklyState.status === 'ready' && !weekly ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{t('weeklyEmpty')}</p>
              <PrimaryButtonLink href={`/${locale}/app/arena`} label={t('ctaArena')} />
            </div>
          ) : null}
        </article>

        <article className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('statusTitle')}
          </p>

          {!readyProfile ? (
            <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
          ) : null}

          {readyProfile ? (
            <div className="mt-3 space-y-4">
              <div
                className="flex items-center justify-end gap-2"
                role="group"
                aria-label={t('streakLine', { days: readyProfile.streak_days })}
              >
                <Flame
                  className={
                    readyProfile.streak_days > 0
                      ? 'h-5 w-5 shrink-0 text-accent'
                      : 'h-5 w-5 shrink-0 text-muted-foreground'
                  }
                  aria-hidden
                />
                <span className="text-lg font-black tabular-nums tracking-tight text-foreground">
                  {t('streakValue', { days: readyProfile.streak_days })}
                </span>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                {userFaction && factionBadge && factionName ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                        {t('factionYourTeam')}
                      </p>
                      <span
                        className={[
                          'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                          factionBadge.bg,
                          factionBadge.text,
                          factionBadge.border,
                        ].join(' ')}
                      >
                        {factionName}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('factionNudgeBody', { faction: factionName })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('noFactionBody')}</p>
                )}
                <div className="mt-3">
                  <PrimaryButtonLink
                    href={factionHref}
                    label={userFaction ? t('ctaFaction') : t('ctaClan')}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </div>

      <article className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
          {t('eventsTitle')}
        </p>
        {eventsState.status === 'loading' ? (
          <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
        ) : null}
        {eventsState.status === 'ready' && eventsState.events.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t('eventsEmpty')}</p>
        ) : null}
        {eventsState.status === 'ready' && eventsState.events.length > 0 ? (
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {eventsState.events.slice(0, 2).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : null}
        <div className="mt-4">
          <PrimaryButtonLink href={`/${locale}/app/events`} label={t('eventsCta')} />
        </div>
      </article>
    </section>
  );
}
