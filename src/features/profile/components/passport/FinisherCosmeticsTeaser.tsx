'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { useFinisherCardLabels } from '@/features/finisher-card/hooks/useFinisherCardLabels';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';
import {
  buildFinisherCardOptionsThumb,
  type FinisherCardLabels,
} from '@/lib/finisher/buildFinisherCardOptions';
import type { FinisherFrameStyle } from '@/lib/finisher/frameStyles';
import { PREMIUM_FINISHER_FRAMES } from '@/lib/finisher/frameStyles';
import type { Division, Faction } from '@/lib/types/database.types';

const INTEREST_KEY = 'tg_monetization_cosmetics_interest';

type Props = {
  username: string;
  faction: Faction;
  division: Division;
};

function FramePreview({
  frameStyle,
  username,
  faction,
  division,
  label,
  labels,
}: {
  frameStyle: FinisherFrameStyle;
  username: string;
  faction: Faction;
  division: Division;
  label: string;
  labels: FinisherCardLabels;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const options = useMemo(
    () =>
      buildFinisherCardOptionsThumb({
        faction,
        division,
        username,
        challengeTitle: 'Weekly Grit Open',
        scoreType: 'reps',
        scoreValue: 142,
        ranked: true,
        frameStyle,
        labels,
      }),
    [division, faction, frameStyle, labels, username],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawFinisherCard(canvas, options);
  }, [options]);

  return (
    <figure className="space-y-2">
      <canvas ref={ref} className="block h-auto w-full rounded-sm border border-border" />
      <figcaption className="text-center text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

export function FinisherCosmeticsTeaser({ username, faction, division }: Props) {
  const t = useTranslations('profile.passport.cosmetics');
  const cardLabels = useFinisherCardLabels();
  const [interested, setInterested] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(INTEREST_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.monetizationCosmeticsViewed);
  }, []);

  const onInterest = useCallback(() => {
    try {
      localStorage.setItem(INTEREST_KEY, '1');
    } catch {
      /* ignore */
    }
    setInterested(true);
    trackEvent(ANALYTICS_EVENTS.monetizationCosmeticsInterest, { surface: 'passport_teaser' });
  }, []);

  const frameLabels: Record<FinisherFrameStyle, string> = {
    standard: t('frames.standard'),
    neon: t('frames.neon'),
    gold: t('frames.gold'),
    carbon: t('frames.carbon'),
  };

  return (
    <section
      className="rounded-sm border border-dashed border-accent/40 bg-muted/10 p-4 space-y-4"
      aria-labelledby="passport-cosmetics-title"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
          {t('kicker')}
        </p>
        <h2
          id="passport-cosmetics-title"
          className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-foreground"
        >
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('body')}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PREMIUM_FINISHER_FRAMES.map((frame) => (
          <FramePreview
            key={frame}
            frameStyle={frame}
            username={username}
            faction={faction}
            division={division}
            label={frameLabels[frame]}
            labels={cardLabels}
          />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{t('noPayToWin')}</p>

      <button
        type="button"
        onClick={onInterest}
        disabled={interested}
        aria-label={interested ? t('interestDone') : t('interestCta')}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-card px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-60"
      >
        {interested ? t('interestDone') : t('interestCta')}
      </button>
    </section>
  );
}
