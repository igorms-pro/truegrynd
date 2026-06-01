import type { Faction } from '@/lib/types/database.types';

const FACTIONS: readonly Faction[] = ['nomads', 'horde', 'iron_alliance'] as const;

export function parseFactionSlug(slug: string): Faction | null {
  const normalized = decodeURIComponent(slug.trim().toLowerCase());
  return FACTIONS.includes(normalized as Faction) ? (normalized as Faction) : null;
}

export function factionPath(locale: string, faction: Faction): string {
  return `/${locale}/app/faction/${faction}`;
}
