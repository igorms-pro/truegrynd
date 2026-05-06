'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef } from 'react';

import { drawFinisherCard } from '@/features/finisher-card/lib/drawCard';
import { useMyScores } from '@/features/profile/hooks/useMyScores';
import type { Faction } from '@/lib/types/database.types';

type Props = {
  userId: string;
  username: string | null;
  faction: Faction | null;
};

function ThumbCanvas({
  username,
  faction,
  challengeTitle,
  scoreType,
  scoreValue,
  ranked,
}: {
  username: string;
  faction: Faction;
  challengeTitle: string;
  scoreType: 'time' | 'reps';
  scoreValue: number;
  ranked: boolean;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const options = useMemo(
    () => ({
      width: 360,
      height: 640,
      faction,
      username,
      challengeTitle,
      scoreType,
      scoreValue,
      topPercent: null,
      rankTextOverride: ranked ? 'RANKED' : 'SAVED',
      rankSubOverride: ranked ? 'VALIDATED' : 'NO VIDEO',
    }),
    [challengeTitle, faction, ranked, scoreType, scoreValue, username],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    drawFinisherCard(canvas, options);
  }, [options]);

  return <canvas ref={ref} className="h-auto w-full block" />;
}

export function FinisherGallery({ userId, username, faction }: Props) {
  const t = useTranslations('profile.gallery');
  const locale = useLocale();
  const { state } = useMyScores(userId, { limit: 6 });

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
      </section>
    );
  }

  if (state.data.length === 0) {
    return (
      <section className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">{t('empty')}</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('title')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {state.data.map((s) => {
          const href = `/${locale}/app/finish?challengeId=${s.challengeId}&ranked=${String(
            s.isValidated,
          )}&scoreId=${encodeURIComponent(s.id)}`;

          return (
            <Link
              key={s.id}
              href={href}
              className="rounded-md border border-border bg-card p-2 hover:border-primary/40"
              aria-label={t('open')}
            >
              <ThumbCanvas
                username={username}
                faction={faction}
                challengeTitle={s.challengeTitle}
                scoreType={s.scoreType}
                scoreValue={s.value}
                ranked={s.isValidated}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
