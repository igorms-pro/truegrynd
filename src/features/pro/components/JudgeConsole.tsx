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
  const [query, setQuery] = useState('');
  const [proofFilter, setProofFilter] = useState<'all' | 'video' | 'novideo'>('all');
  const [challengeFilter, setChallengeFilter] = useState('');
  const [page, setPage] = useState(0);

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

  const PAGE_SIZE = 15;
  const q = query.trim().toLowerCase();
  // Distinct events/challenges present in the queue, for the event filter dropdown.
  const challenges = useMemo(
    () => [...new Set(rows.map((r) => r.challengeTitle))].sort((a, b) => a.localeCompare(b)),
    [rows],
  );
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (q) {
          const hit =
            (r.athleteUsername ?? '').toLowerCase().includes(q) ||
            r.challengeTitle.toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (proofFilter === 'video' && !r.videoUrl) return false;
        if (proofFilter === 'novideo' && r.videoUrl) return false;
        if (challengeFilter && r.challengeTitle !== challengeFilter) return false;
        return true;
      }),
    [rows, q, proofFilter, challengeFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className="space-y-3 rounded-md border border-border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Proof filter — one segmented control, not loose buttons. */}
              <div
                role="group"
                aria-label={t('filter.proofLabel')}
                className="inline-flex overflow-hidden rounded-md border border-border"
              >
                {(['all', 'video', 'novideo'] as const).map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setProofFilter(f);
                      setPage(0);
                    }}
                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                      i > 0 ? 'border-l border-border' : ''
                    } ${
                      proofFilter === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(`filter.${f}`)}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                className="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {challenges.length > 1 ? (
                <select
                  value={challengeFilter}
                  onChange={(e) => {
                    setChallengeFilter(e.target.value);
                    setPage(0);
                  }}
                  aria-label={t('filter.eventLabel')}
                  className="max-w-[14rem] rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('filter.allEvents')}</option>
                  {challenges.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              {t('pendingCount', { count: filtered.length })}
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              {t('noMatch')}
            </p>
          ) : (
            <>
              <ul className="space-y-3">
                {paged.map((item) => (
                  <div key={item.scoreId} className="space-y-1">
                    <Row item={item} busy={busyId === item.scoreId} onVerify={onVerify} />
                    {actionError === item.scoreId ? (
                      <p className="px-1 text-xs font-semibold text-primary">{t('actionError')}</p>
                    ) : null}
                  </div>
                ))}
              </ul>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-sm border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  >
                    {t('pagePrev')}
                  </button>
                  <span className="text-xs font-black tabular-nums text-muted-foreground">
                    {t('pageStatus', { page: safePage + 1, total: totalPages })}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="rounded-sm border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
                  >
                    {t('pageNext')}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
