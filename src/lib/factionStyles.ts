import type { Faction } from '@/lib/types/database.types';

export type FactionBadgeClasses = {
  bg: string;
  text: string;
  border: string;
};

export function getFactionBadgeClasses(faction: Faction): FactionBadgeClasses {
  if (faction === 'nomads') {
    return {
      bg: 'bg-[var(--faction-nomads)]/15',
      text: 'text-[var(--faction-nomads)]',
      border: 'border-[var(--faction-nomads)]/40',
    };
  }
  if (faction === 'horde') {
    return {
      bg: 'bg-[var(--faction-horde)]/15',
      text: 'text-[var(--faction-horde)]',
      border: 'border-[var(--faction-horde)]/40',
    };
  }
  return {
    bg: 'bg-[var(--faction-iron)]/15',
    text: 'text-[var(--faction-iron)]',
    border: 'border-[var(--faction-iron)]/40',
  };
}
