'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useRequireAppAccess } from '@/features/appshell';
import { getApprovedChallengeById } from '@/features/challenges/services/challenges';
import { formatTopPercent, percentileFromCounts } from '@/features/finisher-card/lib/percentile';
import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { getRankCounts } from '@/features/finisher-card/services/rank';
import { getScoreById } from '@/features/finisher-card/services/scores';
import type { Challenge, Score } from '@/lib/types/database.types';

type SearchParams = {
  challengeId?: string;
  ranked?: string;
  scoreId?: string;
};

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; score: Score; challenge: Challenge; topPercent: number | null };

export default function FinishPage({ searchParams }: { searchParams: SearchParams }) {
  const t = useTranslations('finisher');
  const locale = useLocale();
  const access = useRequireAppAccess();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const ranked = searchParams.ranked === 'true';
  const scoreId = searchParams.scoreId ?? null;
  const challengeId = searchParams.challengeId ?? null;
  const hasParams = !!scoreId && !!challengeId;

  useEffect(() => {
    if (access.status !== 'ready') return undefined;
    if (!hasParams) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const [score, challenge] = await Promise.all([
          getScoreById(scoreId),
          getApprovedChallengeById(challengeId),
        ]);
        if (cancelled) return;
        if (!score || !challenge) {
          setState({ status: 'error', message: 'not_found' });
          return;
        }

        let topPercent: number | null = null;
        if (ranked && score.is_validated) {
          const counts = await getRankCounts({
            challengeId: score.challenge_id,
            scoreType: challenge.score_type,
            value: score.value,
          });
          const pct = percentileFromCounts(counts.total, counts.better);
          topPercent = pct ? formatTopPercent(pct.percentile) : null;
        }

        setState({ status: 'ready', score, challenge, topPercent });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [access.status, challengeId, hasParams, ranked, scoreId]);

  const canExport = state.status === 'ready';

  const cardOptions = useMemo(() => {
    if (state.status !== 'ready' || access.status !== 'ready') return null;
    const accessProfile = access.profile;
    const { username, faction } = accessProfile;
    if (!username || !faction) return null;

    return {
      width: 1080,
      height: 1920,
      faction,
      username,
      challengeTitle: state.challenge.title,
      scoreType: state.challenge.score_type,
      scoreValue: state.score.value,
      topPercent: state.topPercent,
    };
  }, [access.profile, access.status, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!cardOptions) return;
    drawFinisherCard(canvas, cardOptions);
  }, [cardOptions]);

  async function onDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'truegrynd-finisher.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function onShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const file = new File([blob], 'truegrynd-finisher.png', { type: 'image/png' });

    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      canShare?: (data: ShareData) => boolean;
    };
    if (!nav.share) return;

    const data: ShareData = { files: [file], title: 'Truegrynd' };
    const canShareFiles = typeof nav.canShare === 'function' ? nav.canShare(data) : false;
    await nav.share(canShareFiles ? data : { title: 'Truegrynd' });
  }

  if (access.status !== 'ready') {
    return (
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (!hasParams) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('error')}</p>
        </header>
        <p className="text-xs text-muted-foreground">missing_params</p>
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

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => void onDownload()}
          disabled={!canExport}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {t('download')}
        </button>
        <button
          type="button"
          onClick={() => void onShare()}
          disabled={!canExport}
          className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted disabled:opacity-50"
        >
          {t('share')}
        </button>
      </div>

      <Link
        href={`/${locale}/app/arena/${state.challenge.id}`}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted"
      >
        {t('backToArena')}
      </Link>
    </section>
  );
}
