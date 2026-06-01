'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { ChallengeDetailCircuitPanel } from '@/features/challenges/components/ChallengeDetailCircuitPanel';
import { ChallengeDetailHero } from '@/features/challenges/components/ChallengeDetailHero';
import { ChallengeDetailLockedPanel } from '@/features/challenges/components/ChallengeDetailLockedPanel';
import { ChallengeDetailSpecPanels } from '@/features/challenges/components/ChallengeDetailSpecPanels';
import { Leaderboard } from '@/features/challenges/components/Leaderboard';
import { useChallenge } from '@/features/challenges/hooks/useChallenge';
import { useMyChallengeParticipation } from '@/features/challenges/hooks/useMyChallengeParticipation';
import { parseChallengeRules } from '@/features/challenges/lib/parseChallengeRules';

type Props = {
  challengeId: string;
};

function BackLink() {
  const locale = useLocale();
  const t = useTranslations('challenge');
  return (
    <Link
      href={`/${locale}/app/arena`}
      className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {t('back')}
    </Link>
  );
}

function NotFound() {
  const t = useTranslations('challenge');
  return (
    <section className="space-y-3">
      <BackLink />
      <h1 className="text-2xl font-black uppercase tracking-tight">{t('notFoundTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('notFoundBody')}</p>
    </section>
  );
}

function DetailSkeleton() {
  const t = useTranslations('challenge');
  return (
    <section className="space-y-5" aria-busy="true">
      <BackLink />
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
      <div className="h-48 animate-pulse rounded-md border border-border bg-muted/40" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-md border border-border bg-muted/30" />
        <div className="h-32 animate-pulse rounded-md border border-border bg-muted/30" />
      </div>
    </section>
  );
}

export function ChallengeDetail({ challengeId }: Props) {
  const locale = useLocale();
  const { data: challenge, loading, error } = useChallenge(challengeId);
  const participationState = useMyChallengeParticipation(
    challengeId,
    challenge?.score_type ?? 'reps',
  );
  const participation =
    participationState.state.status === 'ready' ? participationState.state.data : null;
  const parsedRules = useMemo(
    () => parseChallengeRules(challenge?.rules ?? ''),
    [challenge?.rules],
  );

  if (loading) return <DetailSkeleton />;
  if (error || !challenge) return <NotFound />;

  const isApproved = challenge.status === 'approved';

  return (
    <section className="space-y-5">
      <BackLink />
      <ChallengeDetailHero
        challenge={challenge}
        locale={locale}
        isApproved={isApproved}
        participation={participation}
      />
      {!isApproved ? <ChallengeDetailLockedPanel challenge={challenge} /> : null}
      {parsedRules.circuitLines.length > 0 ? (
        <ChallengeDetailCircuitPanel lines={parsedRules.circuitLines} />
      ) : null}
      <ChallengeDetailSpecPanels challenge={challenge} parsed={parsedRules} />
      {isApproved ? (
        <Leaderboard
          challengeId={challenge.id}
          scoreType={challenge.score_type}
          availableVariants={challenge.variants ?? ['standard']}
        />
      ) : null}
    </section>
  );
}
