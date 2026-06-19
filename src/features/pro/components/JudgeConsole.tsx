'use client';

import { Check, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  listPendingVerifications,
  verifyScore,
  type PendingVerification,
} from '@/features/pro/services/judge';
import { formatScore } from '@/lib/scoring/formatScore';
import type { ProofLevel } from '@/lib/types/database.types';

function proofBadgeClass(level: ProofLevel): string {
  if (level === 'judge_verified') return 'bg-emerald-500/15 text-emerald-400';
  if (level === 'video_ranked') return 'bg-sky-500/15 text-sky-400';
  return 'bg-muted text-muted-foreground';
}

function initials(name: string | null): string {
  if (!name) return '?';
  return name.slice(0, 2).toUpperCase();
}

function Row({
  item,
  busy,
  onVerify,
}: {
  item: PendingVerification;
  busy: boolean;
  onVerify: (id: string) => void;
}) {
  const t = useTranslations('pro.judge');
  const isHorde = item.athleteFaction === 'horde';

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex min-w-[12rem] items-center gap-3">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${isHorde ? 'bg-[var(--faction-horde)]' : 'bg-sky-500'}`}
        />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-black">
          {initials(item.athleteUsername)}
        </span>
        <div>
          <p className="text-sm font-bold">{item.athleteUsername ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{item.athleteDivision ?? ''}</p>
        </div>
      </div>

      <div className="flex-1">
        <p className="flex items-center gap-2 text-sm font-bold">
          {item.challengeTitle}
          <span
            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] ${proofBadgeClass(item.proofLevel)}`}
          >
            {t(`proof.${item.proofLevel}`)}
          </span>
        </p>
      </div>

      <span className="min-w-[5rem] text-right text-base font-black tabular-nums text-accent">
        {formatScore(item.value, item.scoreType)}
      </span>

      <div className="flex min-w-[12rem] items-center justify-end gap-2">
        {item.videoUrl ? (
          <a
            href={item.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:opacity-90"
          >
            <Play className="h-3.5 w-3.5" aria-hidden />
            {t('video')}
          </a>
        ) : (
          <span className="text-xs italic text-muted-foreground">{t('noProof')}</span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onVerify(item.scoreId)}
          className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-600 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
          {busy ? t('validating') : t('validate')}
        </button>
      </div>
    </li>
  );
}

export function JudgeConsole() {
  const t = useTranslations('pro.judge');
  const { state } = useAsyncResource(listPendingVerifications, []);
  const [verifiedIds, setVerifiedIds] = useState<ReadonlySet<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const onVerify = useCallback(async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      await verifyScore(id);
      setVerifiedIds((prev) => new Set(prev).add(id));
    } catch {
      setActionError(id);
    } finally {
      setBusyId(null);
    }
  }, []);

  const rows = useMemo(
    () => (state.status === 'ready' ? state.data.filter((r) => !verifiedIds.has(r.scoreId)) : []),
    [state, verifiedIds],
  );

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>

      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('pendingCount', { count: rows.length })}
          </p>
          <ul className="space-y-3">
            {rows.map((item) => (
              <div key={item.scoreId} className="space-y-1">
                <Row item={item} busy={busyId === item.scoreId} onVerify={onVerify} />
                {actionError === item.scoreId ? (
                  <p className="px-1 text-xs font-semibold text-primary">{t('actionError')}</p>
                ) : null}
              </div>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
