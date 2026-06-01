'use client';

import { useLocale, useTranslations } from 'next-intl';

import {
  buildLeaderboardPresets,
  type LeaderboardPreset,
  type LeaderboardPresetId,
} from '@/features/challenges/lib/leaderboardPresets';
import { getCountryLabel } from '@/lib/location';
import type { Division, Faction } from '@/lib/types/database.types';

type Props = {
  activePresetId: LeaderboardPresetId | null;
  division: Division | undefined;
  faction: Faction | undefined;
  city: string | null | undefined;
  countryCode: string | null | undefined;
  onPresetSelect: (preset: LeaderboardPreset) => void;
};

function presetClass(active: boolean, disabled: boolean): string {
  return [
    'rounded-sm border px-2 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] transition-colors',
    disabled ? 'cursor-not-allowed opacity-40' : 'hover:text-foreground',
    active
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-border bg-background text-muted-foreground',
  ].join(' ');
}

function getPresetLabel(
  preset: LeaderboardPreset,
  t: ReturnType<typeof useTranslations>,
  tFactions: ReturnType<typeof useTranslations>,
  tDivisions: ReturnType<typeof useTranslations>,
  locale: string,
  city: string | null | undefined,
  countryCode: string | null | undefined,
): string {
  const division = preset.filters.division;
  if (preset.id === 'local_top' && division && city) {
    return t('localTop', { division: tDivisions(division), city });
  }
  if (preset.id === 'faction_national' && division && preset.filters.faction && countryCode) {
    return t('factionNational', {
      faction: tFactions(preset.filters.faction),
      division: tDivisions(division),
      country: getCountryLabel(countryCode.toUpperCase(), locale),
    });
  }
  if (preset.id === 'division_global' && division) {
    return t('divisionGlobal', { division: tDivisions(division) });
  }
  return t(preset.id);
}

export function LeaderboardPresetsBar({
  activePresetId,
  division,
  faction,
  city,
  countryCode,
  onPresetSelect,
}: Props) {
  const t = useTranslations('leaderboard.presets');
  const tFactions = useTranslations('factions');
  const tDivisions = useTranslations('divisions');
  const locale = useLocale();

  const presets = buildLeaderboardPresets({ division, faction, city, countryCode });

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{t('legend')}</legend>
      {presets.map((preset) => (
        <button
          key={preset.id}
          type="button"
          disabled={preset.disabled}
          onClick={() => onPresetSelect(preset)}
          className={presetClass(activePresetId === preset.id, preset.disabled)}
          aria-pressed={activePresetId === preset.id}
        >
          {getPresetLabel(preset, t, tFactions, tDivisions, locale, city, countryCode)}
        </button>
      ))}
    </fieldset>
  );
}

export type { LeaderboardPreset, LeaderboardPresetId };
