'use client';

import { useTranslations } from 'next-intl';

import { AGE_BRACKETS, type AgeBracket } from '@/features/challenges/lib/ageBracket';
import type { LeaderboardFilters } from '@/features/challenges/lib/types';
import type { ProofMinFilter } from '@/lib/proof/proofLevel';
import { DIVISIONS } from '@/lib/divisions';
import type { ChallengeVariant, Faction, Sex } from '@/lib/types/database.types';

const PROOF_FILTERS: readonly { id: ProofMinFilter | null; key: string }[] = [
  { id: null, key: 'allProof' },
  { id: 'video_ranked', key: 'videoRanked' },
  { id: 'community_verified', key: 'communityVerified' },
  { id: 'judge_verified', key: 'judgeVerified' },
];
const SEXES: readonly Sex[] = ['male', 'female', 'other'];
const FACTIONS: readonly Faction[] = ['nomads', 'horde', 'iron_alliance'];

type Props = {
  filters: LeaderboardFilters;
  availableVariants: readonly ChallengeVariant[];
  onChange: (next: LeaderboardFilters) => void;
};

function chipClass(active: boolean): string {
  return [
    'rounded-sm border px-2 py-1 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
    active
      ? 'border-primary bg-primary/15 text-primary'
      : 'border-border bg-background text-muted-foreground hover:text-foreground',
  ].join(' ');
}

function FilterRow({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="mr-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

export function LeaderboardFiltersBar({ filters, availableVariants, onChange }: Props) {
  const t = useTranslations('leaderboard.filters');
  const tFactions = useTranslations('factions');
  const tDivisions = useTranslations('divisions');
  const tVariants = useTranslations('variants');
  const tSex = useTranslations('onboarding.identity.sexes');

  const showVariantFilters = availableVariants.length > 1;

  return (
    <div className="space-y-2">
      {showVariantFilters ? (
        <FilterRow legend={t('variant')}>
          <button
            type="button"
            onClick={() => onChange({ ...filters, variant: null })}
            className={chipClass(filters.variant === null)}
          >
            {t('allVariants')}
          </button>
          {availableVariants.map((variant) => (
            <button
              key={variant}
              type="button"
              onClick={() => onChange({ ...filters, variant })}
              className={chipClass(filters.variant === variant)}
            >
              {tVariants(variant)}
            </button>
          ))}
        </FilterRow>
      ) : null}

      <FilterRow legend={t('division')}>
        <button
          type="button"
          onClick={() => onChange({ ...filters, division: null })}
          className={chipClass(filters.division === null)}
        >
          {t('global')}
        </button>
        {DIVISIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange({ ...filters, division: d })}
            className={chipClass(filters.division === d)}
          >
            {tDivisions(d)}
          </button>
        ))}
      </FilterRow>

      <FilterRow legend={t('proof')}>
        {PROOF_FILTERS.map(({ id, key }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...filters, proofMin: id })}
            className={chipClass(filters.proofMin === id)}
          >
            {t(key)}
          </button>
        ))}
      </FilterRow>

      <FilterRow legend={t('sex')}>
        <button
          type="button"
          onClick={() => onChange({ ...filters, sex: null })}
          className={chipClass(filters.sex === null)}
        >
          {t('all')}
        </button>
        {SEXES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange({ ...filters, sex: s })}
            className={chipClass(filters.sex === s)}
          >
            {tSex(s)}
          </button>
        ))}
      </FilterRow>

      <FilterRow legend={t('age')}>
        <button
          type="button"
          onClick={() => onChange({ ...filters, ageBracket: null })}
          className={chipClass(filters.ageBracket === null)}
        >
          {t('all')}
        </button>
        {AGE_BRACKETS.map((b: AgeBracket) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange({ ...filters, ageBracket: b })}
            className={chipClass(filters.ageBracket === b)}
          >
            {t(`ageBrackets.${b}`)}
          </button>
        ))}
      </FilterRow>

      <FilterRow legend={t('faction')}>
        <button
          type="button"
          onClick={() => onChange({ ...filters, faction: null })}
          className={chipClass(filters.faction === null)}
        >
          {t('all')}
        </button>
        {FACTIONS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange({ ...filters, faction: f })}
            className={chipClass(filters.faction === f)}
          >
            {tFactions(f)}
          </button>
        ))}
      </FilterRow>
    </div>
  );
}
