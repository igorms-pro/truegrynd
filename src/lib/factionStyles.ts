import type { Faction } from '@/lib/types/database.types';

export type FactionBadgeClasses = {
  bg: string;
  text: string;
  border: string;
  accent: string;
};

/** Raw CSS variable for a faction's color (for inline styles, e.g. coloured borders). */
export function getFactionColorVar(faction: Faction | null | undefined): string {
  if (!faction) return 'var(--primary)';
  if (faction === 'nomads') return 'var(--faction-nomads)';
  if (faction === 'horde') return 'var(--faction-horde)';
  return 'var(--faction-iron)'; // iron_alliance
}

export function getFactionBadgeClasses(faction: Faction): FactionBadgeClasses {
  if (faction === 'nomads') {
    return {
      bg: 'bg-[var(--faction-nomads)]/15',
      text: 'text-[var(--faction-nomads)]',
      border: 'border-[var(--faction-nomads)]/40',
      accent: 'border-l-[var(--faction-nomads)]',
    };
  }
  if (faction === 'horde') {
    return {
      bg: 'bg-[var(--faction-horde)]/15',
      text: 'text-[var(--faction-horde)]',
      border: 'border-[var(--faction-horde)]/40',
      accent: 'border-l-[var(--faction-horde)]',
    };
  }
  return {
    bg: 'bg-[var(--faction-iron)]/15',
    text: 'text-[var(--faction-iron)]',
    border: 'border-[var(--faction-iron)]/40',
    accent: 'border-l-[var(--faction-iron)]',
  };
}
