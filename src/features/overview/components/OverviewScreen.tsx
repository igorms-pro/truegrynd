'use client';

import { Flame } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { factionPath } from '@/features/factions/lib/factionSlug';
import { useChallengeOfTheDay } from '@/features/overview/hooks/useChallengeOfTheDay';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { getFactionBadgeClasses } from '@/lib/factionStyles';

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
  const tFactions = useTranslations('factions');

  const { state: cotd, refetch: refetchCotd } = useChallengeOfTheDay();
  const { state: profile, refetch: refetchProfile } = useProfile();

  const clanHref = `/${locale}/app/clan`;
  const readyProfile = profile.status === 'ready' ? profile.profile : null;
  const userFaction = readyProfile?.faction ?? null;
  const factionBadge = userFaction ? getFactionBadgeClasses(userFaction) : null;
  const factionName = userFaction ? tFactions(userFaction) : null;
  const factionHref = userFaction ? factionPath(locale, userFaction) : clanHref;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
          {tApp('overviewTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{tApp('overviewBody')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('nextActionTitle')}
          </p>

          {cotd.status === 'loading' ? (
            <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
          ) : null}

          {cotd.status === 'error' ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">{t('error')}</p>
              <button
                type="button"
                onClick={refetchCotd}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-muted px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('retry')}
              </button>
            </div>
          ) : null}

          {cotd.status === 'ready' && cotd.challenge ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-lg font-black uppercase tracking-tight">
                  {cotd.challenge.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{cotd.challenge.description}</p>
              </div>
              <PrimaryButtonLink
                href={`/${locale}/app/arena/${cotd.challenge.id}`}
                label={t('ctaGo')}
              />
            </div>
          ) : null}

          {cotd.status === 'ready' && !cotd.challenge ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">{t('empty')}</p>
              <PrimaryButtonLink href={`/${locale}/app/arena`} label={t('ctaArena')} />
            </div>
          ) : null}
        </article>

        <article className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('statusTitle')}
          </p>

          {profile.status === 'loading' ? (
            <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
          ) : null}

          {profile.status === 'error' ? (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">{t('error')}</p>
              <button
                type="button"
                onClick={refetchProfile}
                className="mt-3 inline-flex items-center justify-center rounded-md bg-muted px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('retry')}
              </button>
            </div>
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
    </section>
  );
}
