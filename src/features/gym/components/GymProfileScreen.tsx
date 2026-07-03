'use client';

import { ArrowLeft, BadgeCheck, MapPin, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getGymProfileBySlug } from '@/features/gym/services/gymProfile';
import { eventPhase, formatEventWindow } from '@/features/pro/lib/eventPhase';
import { useAsyncResource } from '@/hooks/useAsyncResource';

type Props = {
  slug: string;
};

export function GymProfileScreen({ slug }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('gym.public');
  const load = useCallback(() => getGymProfileBySlug(slug), [slug]);
  const { state, refetch } = useAsyncResource(load, [slug]);

  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <section className="space-y-3">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-4">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
        <Link
          href={`/${locale}/app/pro/leagues`}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('backLeagues')}
        </Link>
      </section>
    );
  }

  const gym = state.data;
  const location = [gym.city, gym.countryCode].filter(Boolean).join(', ');

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </button>

      <header className="space-y-3 rounded-md border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
            {t('kicker')}
          </p>
          {gym.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              {t('verified')}
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{gym.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {location}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden />
            {t('members', { count: gym.memberCount })}
          </span>
        </div>
      </header>

      {gym.leagues.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('leaguesTitle')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {gym.leagues.map((l) => (
              <Link
                key={l.id}
                href={`/${locale}/app/pro/leagues/${l.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trophy className="h-3.5 w-3.5" aria-hidden />
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('eventsTitle')}
        </h2>
        {gym.events.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            {t('eventsEmpty')}
          </p>
        ) : (
          <ul className="space-y-2">
            {gym.events.map((ev) => {
              const phase = eventPhase(ev.startsAt, ev.endsAt);
              return (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatEventWindow(ev.startsAt, locale)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                      phase === 'live'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {t(`phase.${phase}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
