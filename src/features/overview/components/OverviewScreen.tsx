'use client';

import { ArrowRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { factionPath } from '@/features/factions/lib/factionSlug';
import { useClanHud } from '@/features/factions/hooks/useClanHud';
import {
  resolveWeeklyDisplayLabel,
  useWeeklyChallenge,
} from '@/features/overview/hooks/useWeeklyChallenge';
import { EventCard } from '@/features/events/components/EventCard';
import { useActiveEvents } from '@/features/events/hooks/useActiveEvents';
import { ComebackWeekBanner } from '@/features/growth/components/ComebackWeekBanner';
import { WeeklyChallengeInvite } from '@/features/growth/components/WeeklyChallengeInvite';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { useProfileRating } from '@/features/profile/hooks/useProfileRating';
import { getComebackEligibility } from '@/lib/growth/comebackWeek';
import { getDivisionBadgeClasses } from '@/lib/divisions';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import { getWeeklyTimeRemaining } from '@/lib/weekly';
import type { Faction } from '@/lib/types/database.types';

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

function SecondaryButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

  const { state: weeklyState } = useWeeklyChallenge();
  const { state: eventsState } = useActiveEvents();
  const appProfile = useOptionalAppProfile();
  const { state: ratingState } = useProfileRating(appProfile?.id ?? null);

  const clanHref = `/${locale}/app/clan`;
  const readyProfile = appProfile;
  const userFaction = readyProfile?.faction ?? null;
  const factionBadge = userFaction ? getFactionBadgeClasses(userFaction) : null;
  const factionName = userFaction ? tFactions(userFaction) : null;
  const factionHref = userFaction ? factionPath(locale, userFaction) : clanHref;
  const divisionBadge = readyProfile ? getDivisionBadgeClasses(readyProfile.division) : null;

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

      {/* HERO — identity + rating + streak + the single primary action */}
      {readyProfile ? (
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xl font-black uppercase tracking-tight">
                {readyProfile.username ?? '—'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {divisionBadge ? (
                  <span
                    className={[
                      'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]',
                      divisionBadge.bg,
                      divisionBadge.text,
                      divisionBadge.border,
                    ].join(' ')}
                  >
                    {readyProfile.division}
                  </span>
                ) : null}
                {userFaction && factionBadge && factionName ? (
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
                ) : null}
              </div>
            </div>
            <div
              className="flex shrink-0 items-center gap-2"
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
              <span className="text-lg font-black tabular-nums tracking-tight">
                {t('streakValue', { days: readyProfile.streak_days })}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('heroRating')}
              </p>
              <p className="mt-1 text-5xl font-black tabular-nums leading-none tracking-tight">
                {ratingValue !== null ? ratingValue : '—'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{t('heroRatingHint')}</p>
            </div>
          </div>

          <div className="mt-5">
            {showComeback ? (
              <SecondaryButtonLink href={primaryHref} label={primaryLabel} />
            ) : (
              <PrimaryButtonLink href={primaryHref} label={primaryLabel} />
            )}
          </div>
        </article>
      ) : (
        <article className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        </article>
      )}

      {/* CONTENT ROW — faction standing + weekly (quiet, tappable) */}
      <div className="grid gap-4 md:grid-cols-2">
        {userFaction ? (
          <FactionStandingCard
            href={factionHref}
            userFaction={userFaction}
            t={t}
            tFactions={tFactions}
          />
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

function FactionStandingCard({
  href,
  userFaction,
  t,
  tFactions,
}: {
  href: string;
  userFaction: Faction;
  t: ReturnType<typeof useTranslations>;
  tFactions: ReturnType<typeof useTranslations>;
}) {
  const { state } = useClanHud();

  const rankings =
    state.status === 'ready' ? [...state.rankings].sort((a, b) => b.points - a.points) : [];
  const myIndex = rankings.findIndex((r) => r.faction === userFaction);
  const myRow = myIndex >= 0 ? rankings[myIndex] : null;
  const rank = myIndex >= 0 ? myIndex + 1 : null;
  const leaderPoints = rankings[0]?.points ?? 0;
  const maxPoints = Math.max(1, leaderPoints);
  const gapText =
    myRow && rank
      ? rank === 1
        ? t('factionLeadingBy', { gap: myRow.points - (rankings[1]?.points ?? 0) })
        : t('factionGapToFirst', { gap: leaderPoints - myRow.points })
      : null;

  return (
    <Link
      href={href}
      aria-label={t('viewFactionAria')}
      className="group block rounded-lg border border-border bg-card p-5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('factionStandingTitle')}
        </p>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>

      {state.status === 'loading' ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('loading')}</p>
      ) : null}

      {state.status === 'error' ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('error')}</p>
      ) : null}

      {state.status === 'ready' && myRow && rank ? (
        <div className="mt-3 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('factionRankLabel')}
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums leading-none">#{rank}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t('factionPointsLabel')}
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums leading-none text-accent">
                {myRow.points.toLocaleString()}
              </p>
            </div>
          </div>

          {gapText ? (
            <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">{gapText}</p>
          ) : null}

          <div className="space-y-2">
            {rankings.map((row) => {
              const mine = row.faction === userFaction;
              return (
                <div key={row.faction} className="flex items-center gap-2">
                  <span
                    className={[
                      'w-24 shrink-0 truncate text-[10px] font-black uppercase tracking-[0.14em]',
                      mine ? 'text-foreground' : 'text-muted-foreground',
                    ].join(' ')}
                  >
                    {tFactions(row.faction)}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className={
                        mine ? 'block h-full bg-accent' : 'block h-full bg-muted-foreground/50'
                      }
                      style={{ width: `${Math.round((row.points / maxPoints) * 100)}%` }}
                    />
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            {t('factionYourShare', { points: state.myContribution.toLocaleString() })}
          </p>
        </div>
      ) : null}
    </Link>
  );
}
