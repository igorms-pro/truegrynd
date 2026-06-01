'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { LeaderboardFiltersBar } from '@/features/challenges/components/LeaderboardFilters';
import { LeaderboardPresetsBar } from '@/features/challenges/components/LeaderboardPresets';
import { RespectButton } from '@/features/challenges/components/RespectButton';
import { useChallengeLeaderboard } from '@/features/challenges/hooks/useChallengeLeaderboard';
import { useScoreRespects } from '@/features/challenges/hooks/useScoreRespects';
import { applyLeaderboardFilters } from '@/features/challenges/lib/applyFilters';
import {
  buildLeaderboardPresets,
  findMatchingPresetId,
  type LeaderboardPreset,
  type LeaderboardPresetId,
} from '@/features/challenges/lib/leaderboardPresets';
import { resolveLeaderboardFilters } from '@/features/challenges/lib/resolveLeaderboardFilters';
import { sortScoresByType } from '@/features/challenges/lib/leaderboardSort';
import { formatScore } from '@/features/challenges/lib/scoreFormat';
import {
  EMPTY_FILTERS,
  type LeaderboardEntry,
  type LeaderboardFilters,
} from '@/features/challenges/lib/types';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { DivisionBadge } from '@/components/DivisionBadge';
import { ProofLevelBadge } from '@/components/ProofLevelBadge';
import { ReportScoreButton } from '@/features/challenges/components/ReportScoreButton';
import type { ScoreType } from '@/lib/types/database.types';

type Props = {
  challengeId: string;
  scoreType: ScoreType;
  availableVariants: readonly import('@/lib/types/database.types').ChallengeVariant[];
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
  showDivisionBadge,
}: {
  rank: number;
  entry: LeaderboardEntry;
  scoreType: ScoreType;
  currentUserId: string | null;
  respectCount: number;
  isRespected: boolean;
  respectDisabled: boolean;
  onRespectToggle: (scoreId: string) => Promise<void>;
  showDivisionBadge: boolean;
}) {
  const username = entry.profile?.username ?? '—';
  return (
    <li className="border-b border-border px-3 py-2 last:border-b-0">
      <div className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-3">
        <span className="font-mono text-sm tabular-nums text-muted-foreground">#{rank}</span>
        <div className="min-w-0">
          <span className="block truncate text-sm font-bold text-foreground">{username}</span>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <ProofLevelBadge level={entry.proof_level} compact />
            {showDivisionBadge && entry.profile?.division ? (
              <DivisionBadge division={entry.profile.division} />
            ) : null}
          </div>
        </div>
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
      </div>
      <ReportScoreButton
        scoreId={entry.id}
        scoreUserId={entry.user_id}
        currentUserId={currentUserId}
      />
    </li>
  );
}

function pickDefaultPreset(
  presets: ReturnType<typeof buildLeaderboardPresets>,
): LeaderboardPreset | null {
  return (
    presets.find((preset) => preset.id === 'local_top' && !preset.disabled) ??
    presets.find((preset) => preset.id === 'faction_national' && !preset.disabled) ??
    presets.find((preset) => !preset.disabled) ??
    null
  );
}

export function Leaderboard({ challengeId, scoreType, availableVariants }: Props) {
  const t = useTranslations('leaderboard');
  const profile = useOptionalAppProfile();
  const { data, loading, error, refetch } = useChallengeLeaderboard({
    challengeId,
    scoreType,
  });
  const [filtersOverride, setFiltersOverride] = useState<LeaderboardFilters | null>(null);
  const [activePresetIdOverride, setActivePresetIdOverride] = useState<LeaderboardPresetId | null>(
    null,
  );
  const [divisionFilterTouched, setDivisionFilterTouched] = useState(false);
  const [variantFilterTouched, setVariantFilterTouched] = useState(false);

  const presets = useMemo(
    () =>
      buildLeaderboardPresets({
        division: profile?.division,
        faction: profile?.faction ?? undefined,
        city: profile?.city,
        countryCode: profile?.country_code,
      }),
    [profile?.division, profile?.faction, profile?.city, profile?.country_code],
  );

  const defaultPreset = useMemo(() => pickDefaultPreset(presets), [presets]);
  const usingDefaultPreset = filtersOverride === null && defaultPreset !== null;
  const baseFilters = filtersOverride ?? defaultPreset?.filters ?? EMPTY_FILTERS;
  const activePresetId =
    activePresetIdOverride ??
    (usingDefaultPreset ? (defaultPreset?.id ?? null) : findMatchingPresetId(presets, baseFilters));

  const effectiveFilters = resolveLeaderboardFilters({
    filters: baseFilters,
    profileDivision: profile?.division,
    divisionFilterTouched: divisionFilterTouched || usingDefaultPreset,
    availableVariants,
    variantFilterTouched,
  });

  const handlePresetSelect = (preset: LeaderboardPreset): void => {
    if (preset.disabled) return;
    setFiltersOverride(preset.filters);
    setActivePresetIdOverride(preset.id);
    setDivisionFilterTouched(true);
    setVariantFilterTouched(false);
  };

  const handleFiltersChange = (next: LeaderboardFilters): void => {
    if (next.division !== baseFilters.division) {
      setDivisionFilterTouched(true);
    }
    if (next.variant !== baseFilters.variant) {
      setVariantFilterTouched(true);
    }
    setFiltersOverride(next);
    setActivePresetIdOverride(findMatchingPresetId(presets, next));
  };

  const sorted = useMemo(
    () => sortScoresByType(applyLeaderboardFilters(data, effectiveFilters), scoreType),
    [data, effectiveFilters, scoreType],
  );

  const showDivisionBadge = effectiveFilters.division === null;

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

      <LeaderboardPresetsBar
        activePresetId={activePresetId}
        division={profile?.division}
        faction={profile?.faction ?? undefined}
        city={profile?.city}
        countryCode={profile?.country_code}
        onPresetSelect={handlePresetSelect}
      />

      <LeaderboardFiltersBar
        filters={effectiveFilters}
        availableVariants={availableVariants}
        onChange={handleFiltersChange}
      />

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
              showDivisionBadge={showDivisionBadge}
            />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
