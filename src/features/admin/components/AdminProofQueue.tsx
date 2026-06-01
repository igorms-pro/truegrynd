'use client';

import { useTranslations } from 'next-intl';

import { useAdminProofQueue } from '@/features/admin/hooks/useAdminProofQueue';
import { ProofLevelBadge } from '@/components/ProofLevelBadge';
import { PROOF_LEVELS } from '@/lib/proof/proofLevel';
import type { ProofLevel } from '@/lib/types/database.types';

const JUDGE_ACTIONS: ProofLevel[] = ['judge_verified', 'honor'];

export function AdminProofQueue() {
  const t = useTranslations('admin.proof');
  const { state, busyScoreId, refetch, setProofLevel } = useAdminProofQueue();

  if (state.status === 'loading') {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {t('loading')}
      </p>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
          {t('errorTitle')}
        </p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (state.rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {state.rows.map((row) => (
        <li key={row.reportId} className="rounded-md border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-tight">{row.challengeTitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                @{row.username} · {row.value} · {new Date(row.submittedAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-xs text-foreground">{row.reportReason}</p>
            </div>
            <ProofLevelBadge level={row.proofLevel} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {JUDGE_ACTIONS.map((level) => (
              <button
                key={level}
                type="button"
                disabled={busyScoreId === row.scoreId}
                onClick={() => void setProofLevel(row.scoreId, level, t('auditNote'))}
                className="min-h-10 rounded-sm border border-border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] hover:border-primary disabled:opacity-50"
              >
                {t(`actions.${level}`)}
              </button>
            ))}
            {row.videoUrl ? (
              <a
                href={row.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center rounded-sm border border-border px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]"
              >
                {t('watchVideo')}
              </a>
            ) : null}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {t('levelsLegend')}: {PROOF_LEVELS.join(' → ')}
          </p>
        </li>
      ))}
    </ul>
  );
}
