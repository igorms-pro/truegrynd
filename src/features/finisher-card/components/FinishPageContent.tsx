'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { FinisherCardActions } from '@/features/finisher-card/components/FinisherCardActions';
import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { useFinisherCard } from '@/features/finisher-card/hooks/useFinisherCard';
import { buildFinisherCardOptionsFull } from '@/lib/finisher';

export function FinishPageContent() {
  const t = useTranslations('finisher');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ranked = searchParams.get('ranked') === 'true';
  const scoreId = searchParams.get('scoreId');
  const challengeId = searchParams.get('challengeId');
  const { retry, ...state } = useFinisherCard({ ranked, scoreId, challengeId });

  const cardOptions = useMemo(() => {
    if (state.status !== 'ready') return null;
    const ready = state;
    return buildFinisherCardOptionsFull({
      faction: ready.faction,
      division: ready.division,
      username: ready.username,
      challengeTitle: ready.challenge.title,
      scoreType: ready.challenge.score_type,
      scoreValue: ready.score.value,
      topPercent: ready.topPercent,
      weeklyBadge: ready.weeklyBadge ?? undefined,
      ranked,
      isValidated: ready.score.is_validated,
    });
  }, [ranked, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !cardOptions) return;
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
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
          <Link
            href={`/${locale}/app/arena${challengeId ? `/${challengeId}` : ''}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('backToArena')}
          </Link>
        </div>
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

      {state.score.video_url ? (
        <a
          href={state.score.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border bg-muted px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('viewProof')}
        </a>
      ) : null}

      <Link
        href={`/${locale}/app/arena/${state.challenge.id}`}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted"
      >
        {t('backToArena')}
      </Link>
    </section>
  );
}
