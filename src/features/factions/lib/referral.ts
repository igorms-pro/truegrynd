import type { Faction } from '@/lib/types/database.types';

const STORAGE_KEY = 'tg_referral_faction';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const VALID_FACTIONS: ReadonlySet<string> = new Set<string>(['nomads', 'horde', 'iron_alliance']);

type StoredReferral = {
  faction: Faction;
  expiresAt: number;
};

export function parseReferralFaction(value: string | null): Faction | null {
  if (!value || !VALID_FACTIONS.has(value)) return null;
  return value as Faction;
}

export function storeReferralFaction(faction: Faction): void {
  try {
    const entry: StoredReferral = { faction, expiresAt: Date.now() + TTL_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    /* quota or private mode — ignore */
  }
}

export function loadReferralFaction(): Faction | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as StoredReferral;
    if (!entry.faction || !VALID_FACTIONS.has(entry.faction)) return null;
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return entry.faction;
  } catch {
    return null;
  }
}

export function clearReferralFaction(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildReferralUrl(baseUrl: string, faction: Faction): string {
  const url = new URL(baseUrl);
  url.searchParams.set('faction', faction);
  return url.toString();
}
