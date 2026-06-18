'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import { useChallenge } from '@/features/challenges/hooks/useChallenge';

type Params = { challengeId: string; locale: string };

export default function ChallengeLeaderboardPage({ params }: { params: Promise<Params> }) {
  const { challengeId } = use(params);
  const locale = useLocale();
  const t = useTranslations('leaderboard');
  const tChallenge = useTranslations('challenge');
  const { data: challenge, loading, error } = useChallenge(challengeId);

  return (
    <section className="space-y-5">
      <Link
        href={`/${locale}/app/arena/${challengeId}`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {tChallenge('back')}
      </Link>

      {loading ? (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      ) : null}

      {!loading && (error || !challenge) ? (
        <p className="text-sm text-muted-foreground">{t('errorTitle')}</p>
      ) : null}

      {challenge ? (
        <>
          <header className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              {challenge.title}
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">{t('fullTitle')}</h1>
          </header>
          <Leaderboard
            challengeId={challenge.id}
            scoreType={challenge.score_type}
            availableVariants={challenge.variants ?? ['standard']}
            mode="full"
          />
        </>
      ) : null}
    </section>
  );
}
