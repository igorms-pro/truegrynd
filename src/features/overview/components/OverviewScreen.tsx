'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { useProfile } from '@/features/profile/hooks/useProfile';
import { useChallengeOfTheDay } from '@/features/overview/hooks/useChallengeOfTheDay';

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

  const { state: cotd, refetch: refetchCotd } = useChallengeOfTheDay();
  const { state: profile, refetch: refetchProfile } = useProfile();

  const clanHref = `/${locale}/app/clan`;

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

          {profile.status === 'ready' ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-foreground">
                  {t('streakLabel')}
                </p>
                <p className="text-sm text-foreground/90">
                  {t('streakValue', { days: profile.profile.streak_days })}
                </p>
              </div>

              <div className="rounded-md border border-border bg-background p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                  {t('factionNudgeTitle')}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {profile.profile.faction ? t('factionNudgeBody') : t('noFactionBody')}
                </p>
                <PrimaryButtonLink href={clanHref} label={t('ctaClan')} />
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}
