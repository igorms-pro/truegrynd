'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ChallengeDetailSection } from '@/features/challenges/components/ChallengeDetailSection';
import type { Challenge } from '@/lib/types/database.types';

type Props = {
  challenge: Challenge;
};

type PendingStep = {
  key: 'pendingStep1' | 'pendingStep2' | 'pendingStep3';
  done: boolean;
  active?: boolean;
};

function PendingSteps() {
  const t = useTranslations('challenge');
  const steps: PendingStep[] = [
    { key: 'pendingStep1', done: true },
    { key: 'pendingStep2', done: true, active: true },
    { key: 'pendingStep3', done: false },
  ];

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={[
            'flex flex-1 items-center gap-2 rounded-sm border px-3 py-2 sm:rounded-none sm:border-y sm:border-l-0 sm:first:rounded-l-sm sm:first:border-l sm:last:rounded-r-sm',
            step.active
              ? 'border-accent/50 bg-accent/10'
              : step.done
                ? 'border-border bg-background/80'
                : 'border-border bg-background/40 text-muted-foreground',
          ].join(' ')}
        >
          <span
            className={[
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black',
              step.active ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
            ].join(' ')}
          >
            {index + 1}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.14em]">{t(step.key)}</span>
        </li>
      ))}
    </ol>
  );
}

export function ChallengeDetailLockedPanel({ challenge }: Props) {
  const t = useTranslations('challenge');
  const isRejected = challenge.status === 'rejected';

  return (
    <ChallengeDetailSection
      tone={isRejected ? 'primary' : 'accent'}
      icon={isRejected ? ShieldAlert : ShieldCheck}
      title={isRejected ? t('rejectedTitle') : t('pendingTitle')}
      withWash
    >
      <p className="text-sm leading-relaxed text-foreground/85">
        {isRejected ? t('rejectedBody') : t('pendingBody')}
      </p>
      {!isRejected ? <PendingSteps /> : null}
      {isRejected && challenge.rejection_reason?.trim() ? (
        <p className="whitespace-pre-line rounded-sm border border-border bg-background/60 p-3 text-sm text-foreground/90">
          {t('rejectionModeratorNote', { note: challenge.rejection_reason.trim() })}
        </p>
      ) : null}
    </ChallengeDetailSection>
  );
}
