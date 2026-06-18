'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { useFinisherCardLabels } from '@/features/finisher-card/hooks/useFinisherCardLabels';
import { useMyScores } from '@/hooks/useMyScores';
import { buildFinisherCardOptionsThumb, type FinisherCardLabels } from '@/lib/finisher';
import type { Division, Faction } from '@/lib/types/database.types';

const GALLERY_PREVIEW_LIMIT = 4;

type Props = {
  userId: string;
  username: string | null;
  faction: Faction | null;
  division: Division;
};

function ThumbCanvas({
  username,
  faction,
  division,
  challengeTitle,
  scoreType,
  scoreValue,
  ranked,
  labels,
}: {
  username: string;
  faction: Faction;
  division: Division;
  challengeTitle: string;
  scoreType: 'time' | 'reps';
  scoreValue: number;
  ranked: boolean;
  labels: FinisherCardLabels;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const options = useMemo(
    () =>
      buildFinisherCardOptionsThumb({
        faction,
        division,
        username,
        challengeTitle,
        scoreType,
        scoreValue,
        ranked,
        labels,
      }),
    [challengeTitle, division, faction, labels, ranked, scoreType, scoreValue, username],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawFinisherCard(canvas, options);
  }, [options]);

  return <canvas ref={ref} className="h-auto w-full block" />;
}

export function FinisherGallery({ userId, username, faction, division }: Props) {
  const t = useTranslations('profile.gallery');
  const locale = useLocale();
  const cardLabels = useFinisherCardLabels();
  const { state, refetch } = useMyScores(userId, {
    limit: GALLERY_PREVIEW_LIMIT,
    excludeHidden: true,
  });
  const historyHref = `/${locale}/app/profile/history`;

  if (!username || !faction) {
    return null;
  }

  if (state.status === 'loading') {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('error')}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('retry')}
        </button>
      </section>
    );
  }

  if (state.data.length === 0) {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('title')}
          </p>
          <Link
            href={historyHref}
            aria-label={t('showMoreAria')}
            className="inline-flex min-h-11 items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('showMore')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{t('empty')}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <Link
          href={historyHref}
          aria-label={t('showMoreAria')}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('showMore')}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
        {state.data.map((s) => {
          const href = `/${locale}/app/finish?challengeId=${s.challengeId}&ranked=${String(
            s.isValidated,
          )}&scoreId=${encodeURIComponent(s.id)}`;

          return (
            <Link
              key={s.id}
              href={href}
              className="w-[42%] min-w-[9.5rem] max-w-[11rem] shrink-0 snap-start rounded-md border border-border bg-card p-2 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('open')}
            >
              <ThumbCanvas
                username={username}
                faction={faction}
                division={division}
                challengeTitle={s.challengeTitle}
                scoreType={s.scoreType}
                scoreValue={s.value}
                ranked={s.isValidated}
                labels={cardLabels}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
