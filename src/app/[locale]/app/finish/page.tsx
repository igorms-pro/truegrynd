'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

import { FinisherCardActions } from '@/features/finisher-card/components/FinisherCardActions';
import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { useFinisherCard } from '@/features/finisher-card/hooks/useFinisherCard';

type SearchParams = {
  challengeId?: string;
  ranked?: string;
  scoreId?: string;
};

export default function FinishPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations('finisher');
  const locale = useLocale();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ranked = searchParams.ranked === 'true';
  const scoreId = searchParams.scoreId ?? null;
  const challengeId = searchParams.challengeId ?? null;
  const state = useFinisherCard({ ranked, scoreId, challengeId });

  const cardOptions = useMemo(() => {
    if (state.status !== 'ready') return null;
    return {
      width: 1080,
      height: 1920,
      faction: state.faction,
      username: state.username,
      challengeTitle: state.challenge.title,
      scoreType: state.challenge.score_type,
      scoreValue: state.score.value,
      topPercent: state.topPercent,
    };
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!cardOptions) return;
    drawFinisherCard(canvas, cardOptions);
  }, [cardOptions]);

  if (state.status === 'gated') {
    return (
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (state.status === 'missing_params') {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('error')}</p>
        </header>
        <Link
          href={`/${locale}/app/arena`}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted"
        >
          {t('backToArena')}
        </Link>
      </section>
    );
  }

  if (state.status === 'loading') {
    return (
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('error')}</p>
        </header>
        <p className="text-xs text-muted-foreground">{state.message}</p>
        <Link
          href={`/${locale}/app/arena${challengeId ? `/${challengeId}` : ''}`}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted"
        >
          {t('backToArena')}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{ranked ? t('rankedBody') : t('savedBody')}</p>
      </header>

      <div className="rounded-md border border-border bg-card p-3">
        <canvas ref={canvasRef} className="w-full h-auto block" />
      </div>

      <FinisherCardActions canvasRef={canvasRef} disabled={!cardOptions} />

      <Link
        href={`/${locale}/app/arena/${state.challenge.id}`}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted"
      >
        {t('backToArena')}
      </Link>
    </section>
  );
}
