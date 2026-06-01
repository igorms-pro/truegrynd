import type { Division, Faction } from '@/lib/types/database.types';

export function buildFinisherTagline(faction: Faction, division: Division): string {
  const factionLabel = faction.replace('_', ' ').toUpperCase();
  return `I SCORED FOR ${factionLabel} ${division.toUpperCase()}`;
}

export function formatRatingDelta(delta: number): string {
  const rounded = Math.round(delta * 10) / 10;
  const prefix = rounded > 0 ? '+' : '';
  return `${prefix}${rounded} RATING`;
}

export function formatWarPoints(points: number): string {
  return `+${Math.round(points)} WAR PTS`;
}
