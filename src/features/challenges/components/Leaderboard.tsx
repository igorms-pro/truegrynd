'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { LeaderboardFiltersBar } from '@/features/challenges/components/LeaderboardFilters';
import { RespectButton } from '@/features/challenges/components/RespectButton';
import { useChallengeLeaderboard } from '@/features/challenges/hooks/useChallengeLeaderboard';
import { useScoreRespects } from '@/features/challenges/hooks/useScoreRespects';
import { applyLeaderboardFilters } from '@/features/challenges/lib/applyFilters';
import { sortScoresByType } from '@/features/challenges/lib/leaderboardSort';
import { formatScore } from '@/features/challenges/lib/scoreFormat';
import {
  EMPTY_FILTERS,
  type LeaderboardEntry,
  type LeaderboardFilters,
} from '@/features/challenges/lib/types';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import type { ScoreType } from '@/lib/types/database.types';

type Props = {
  challengeId: string;
  scoreType: ScoreType;
};

function LeaderboardRow({
  rank,
  entry,
  scoreType,
  currentUserId,
  respectCount,
  isRespected,
  respectDisabled,
  onRespectToggle,
}: {
  rank: number;
  entry: LeaderboardEntry;
  scoreType: ScoreType;
  currentUserId: string | null;
  respectCount: number;
  isRespected: boolean;
  respectDisabled: boolean;
  onRespectToggle: (scoreId: string) => Promise<void>;
}) {
  const username = entry.profile?.username ?? '—';
  return (
    <li className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <span className="font-mono text-sm tabular-nums text-muted-foreground">#{rank}</span>
      <span className="truncate text-sm font-bold text-foreground">{username}</span>
      <span className="font-mono text-sm tabular-nums text-foreground">
        {formatScore(entry.value, scoreType)}
      </span>
      <RespectButton
        scoreId={entry.id}
        scoreUserId={entry.user_id}
        currentUserId={currentUserId}
        count={respectCount}
        respected={isRespected}
        disabled={respectDisabled}
        onToggle={onRespectToggle}
      />
    </li>
  );
}

export function Leaderboard({ challengeId, scoreType }: Props) {
  const t = useTranslations('leaderboard');
  const profile = useOptionalAppProfile();
  const { data, loading, error, refetch } = useChallengeLeaderboard({
    challengeId,
    scoreType,
  });
  const [filters, setFilters] = useState<LeaderboardFilters>(EMPTY_FILTERS);

  const sorted = useMemo(
    () => sortScoresByType(applyLeaderboardFilters(data, filters), scoreType),
    [data, filters, scoreType],
  );

  const scoreIds = useMemo(() => sorted.map((e) => e.id), [sorted]);
  const {
    counts,
    respected,
    loading: respectLoading,
    toggle,
  } = useScoreRespects(scoreIds, profile?.id ?? null);

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
      </header>

      <LeaderboardFiltersBar filters={filters} onChange={setFilters} />

      {loading ? (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      ) : null}

      {!loading && error ? (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
      ) : null}

      {!loading && !error && sorted.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        </div>
      ) : null}

      {!loading && !error && sorted.length > 0 ? (
        <ol className="overflow-hidden rounded-md border border-border bg-card">
          {sorted.map((entry, index) => (
            <LeaderboardRow
              key={entry.id}
              rank={index + 1}
              entry={entry}
              scoreType={scoreType}
              currentUserId={profile?.id ?? null}
              respectCount={counts.get(entry.id) ?? 0}
              isRespected={respected.has(entry.id)}
              respectDisabled={respectLoading}
              onRespectToggle={toggle}
            />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
