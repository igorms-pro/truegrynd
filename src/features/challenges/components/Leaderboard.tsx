'use client';

import { ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

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
import { ProofLevelBadge } from '@/components/ProofLevelBadge';
import { ReportScoreButton } from '@/features/challenges/components/ReportScoreButton';
import type { ScoreType } from '@/lib/types/database.types';

type Props = {
  challengeId: string;
  scoreType: ScoreType;
  availableVariants: readonly import('@/lib/types/database.types').ChallengeVariant[];
  /** 'preview' = compact top rows + link to the full page; 'full' = filterable page. */
  mode?: 'preview' | 'full';
};

function rankColorClass(rank: number): string {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-zinc-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
}

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
  isCurrentUser,
  youLabel,
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
  isCurrentUser: boolean;
  youLabel: string;
}) {
  const username = entry.profile?.username ?? '—';
  return (
    <li
      className={[
        'border-b border-border px-3 py-2 last:border-b-0',
        isCurrentUser ? 'bg-accent/10 ring-1 ring-inset ring-accent/40' : '',
      ].join(' ')}
    >
      <div className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-3">
        <span className={`font-mono text-sm font-black tabular-nums ${rankColorClass(rank)}`}>
          #{rank}
        </span>
        <div className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{username}</span>
            {isCurrentUser ? (
              <span className="shrink-0 rounded-sm bg-accent px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-accent-foreground">
                {youLabel}
              </span>
            ) : null}
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ProofLevelBadge level={entry.proof_level} compact />
            {showDivisionBadge && entry.profile?.division ? (
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {entry.profile.division}
              </span>
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

const PROOF_SUMMARY_KEY: Record<string, string> = {
  video_ranked: 'videoRanked',
  community_verified: 'communityVerified',
  judge_verified: 'judgeVerified',
};

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

export function Leaderboard({ challengeId, scoreType, availableVariants, mode = 'full' }: Props) {
  const isPreview = mode === 'preview';
  const locale = useLocale();
  const t = useTranslations('leaderboard');
  const tFilters = useTranslations('leaderboard.filters');
  const tFactions = useTranslations('factions');
  const tDivisions = useTranslations('divisions');
  const tVariants = useTranslations('variants');
  const tSex = useTranslations('onboarding.identity.sexes');
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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Compact summary of which filters are active (shown while the panel is collapsed).
  const filterChips: string[] = [];
  if (effectiveFilters.division) filterChips.push(tDivisions(effectiveFilters.division));
  if (effectiveFilters.variant) filterChips.push(tVariants(effectiveFilters.variant));
  if (effectiveFilters.proofMin)
    filterChips.push(tFilters(PROOF_SUMMARY_KEY[effectiveFilters.proofMin] ?? 'allProof'));
  if (effectiveFilters.sex) filterChips.push(tSex(effectiveFilters.sex));
  if (effectiveFilters.ageBracket)
    filterChips.push(tFilters(`ageBrackets.${effectiveFilters.ageBracket}`));
  if (effectiveFilters.faction) filterChips.push(tFactions(effectiveFilters.faction));
  if (effectiveFilters.city) filterChips.push(effectiveFilters.city.toUpperCase());

  const currentUserId = profile?.id ?? null;
  const myIndex = currentUserId ? sorted.findIndex((e) => e.user_id === currentUserId) : -1;
  // Preview (challenge detail) shows the top N then links to the full page.
  // The full page shows the entire ranked list — no cap, no "show more".
  const PREVIEW_CAP = 10;
  const visible = isPreview ? sorted.slice(0, PREVIEW_CAP) : sorted;
  const myRowHiddenInPreview = isPreview && myIndex >= PREVIEW_CAP;

  const renderRow = (entry: LeaderboardEntry, index: number) => (
    <LeaderboardRow
      key={entry.id}
      rank={index + 1}
      entry={entry}
      scoreType={scoreType}
      currentUserId={currentUserId}
      respectCount={counts.get(entry.id) ?? 0}
      isRespected={respected.has(entry.id)}
      respectDisabled={respectLoading}
      onRespectToggle={toggle}
      showDivisionBadge={showDivisionBadge}
      isCurrentUser={currentUserId !== null && entry.user_id === currentUserId}
      youLabel={t('you')}
    />
  );

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black uppercase tracking-tight">{t('title')}</h2>
        {!isPreview ? (
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            {t('filtersToggle')}
            {filterChips.length > 0 ? (
              <span className="rounded-full bg-primary px-1.5 text-[10px] tabular-nums text-primary-foreground">
                {filterChips.length}
              </span>
            ) : null}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
        ) : null}
      </header>

      {isPreview ? null : filtersOpen ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-3">
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
        </div>
      ) : filterChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {filterChips.map((chip, i) => (
            <span
              key={`${chip}-${i}`}
              className="rounded-sm border border-border bg-background px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

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
        <div className="space-y-3">
          <ol className="overflow-hidden rounded-md border border-border bg-card">
            {visible.map((entry, index) => renderRow(entry, index))}
          </ol>

          {myRowHiddenInPreview ? (
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                {t('yourPosition')}
              </p>
              <ol className="overflow-hidden rounded-md border border-accent/40 bg-card">
                {renderRow(sorted[myIndex], myIndex)}
              </ol>
            </div>
          ) : null}

          {isPreview ? (
            <Link
              href={`/${locale}/app/arena/${challengeId}/leaderboard`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t('viewFull')}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
