'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useChallenge } from '@/hooks/useChallenge';
import { clearChallengeCommitment, recordChallengeCommitment } from '@/lib/commitments';
import { ScoreSubmissionForm } from '@/features/submission/components/ScoreSubmissionForm';

type Props = {
  challengeId: string;
};

type Result = { ranked: boolean; insertedId: string };

function ResultCard({ ranked }: { ranked: boolean }) {
  const t = useTranslations('submission');
  const title = ranked ? t('resultRankedTitle') : t('resultSavedTitle');
  const body = ranked ? t('resultRankedBody') : t('resultSavedBody');
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function ScoreSubmissionScreen({ challengeId }: Props) {
  const t = useTranslations('submission');
  const tArena = useTranslations('arena');
  const locale = useLocale();
  const router = useRouter();
  const { data: challenge, loading, error } = useChallenge(challengeId);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!challenge || challenge.status !== 'approved') return;
    recordChallengeCommitment(challenge.id, challenge.title);
  }, [challenge]);

  if (loading) {
    return (
      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (error || !challenge) {
    return (
      <section className="space-y-3">
        <Link
          href={`/${locale}/app/arena/${challengeId}`}
          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('back')}
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('errors.submitFailed')}</p>
      </section>
    );
  }

  if (challenge.status !== 'approved') {
    return (
      <section className="space-y-4">
        <Link
          href={`/${locale}/app/arena/${challenge.id}`}
          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('back')}
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('errors.notApproved')}</p>
      </section>
    );
  }

  const challengeLineKey =
    challenge.score_type === 'time' ? 'challengeLineTime' : 'challengeLineReps';

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/app/arena/${challenge.id}`}
        className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('back')}
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-border bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {tArena(`scoreType.${challenge.score_type}`)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t(challengeLineKey, { title: challenge.title })}
        </p>
      </header>

      {result ? <ResultCard ranked={result.ranked} /> : null}

      <ScoreSubmissionForm
        challengeId={challenge.id}
        scoreType={challenge.score_type}
        availableVariants={challenge.variants ?? ['standard']}
        maxDurationSeconds={challenge.max_duration_seconds ?? null}
        onSubmitted={(r) => {
          clearChallengeCommitment(challenge.id);
          setResult(r);
          router.push(
            `/${locale}/app/finish?challengeId=${challenge.id}&ranked=${String(r.ranked)}&scoreId=${encodeURIComponent(
              r.insertedId,
            )}`,
          );
        }}
      />
    </section>
  );
}
