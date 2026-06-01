import { isDivision } from '@/lib/divisions';
import type { Division, Faction } from '@/lib/types/database.types';

const STORAGE_KEY = 'tg_referral_context';
const LEGACY_STORAGE_KEY = 'tg_referral_faction';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const VALID_FACTIONS: ReadonlySet<string> = new Set<string>(['nomads', 'horde', 'iron_alliance']);

export type ReferralParams = {
  faction: Faction;
  division?: Division;
  weekly?: string;
  event?: string;
  rival?: string;
};

type StoredReferral = ReferralParams & {
  expiresAt: number;
};

function isValidFaction(value: string): value is Faction {
  return VALID_FACTIONS.has(value);
}

export function parseReferralFaction(value: string | null): Faction | null {
  if (!value || !isValidFaction(value)) return null;
  return value;
}

export function parseReferralDivision(value: string | null): Division | null {
  if (!value || !isDivision(value)) return null;
  return value;
}

export function parseReferralParams(searchParams: URLSearchParams): ReferralParams | null {
  const faction = parseReferralFaction(searchParams.get('faction'));
  if (!faction) return null;

  const division = parseReferralDivision(searchParams.get('division'));
  const weekly = searchParams.get('weekly')?.trim() || undefined;
  const event = searchParams.get('event')?.trim() || undefined;
  const rival = searchParams.get('rival')?.trim() || undefined;

  return {
    faction,
    ...(division ? { division } : {}),
    ...(weekly ? { weekly } : {}),
    ...(event ? { event } : {}),
    ...(rival ? { rival } : {}),
  };
}

function readStoredReferral(): StoredReferral | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const entry = JSON.parse(raw) as StoredReferral;
      if (!entry.faction || !isValidFaction(entry.faction)) return null;
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return entry;
    }

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) return null;
    const legacy = JSON.parse(legacyRaw) as { faction: Faction; expiresAt: number };
    if (!legacy.faction || !isValidFaction(legacy.faction)) return null;
    if (Date.now() > legacy.expiresAt) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }
    return { faction: legacy.faction, expiresAt: legacy.expiresAt };
  } catch {
    return null;
  }
}

export function storeReferralContext(params: ReferralParams): void {
  try {
    const entry: StoredReferral = { ...params, expiresAt: Date.now() + TTL_MS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* quota or private mode */
  }
}

export function storeReferralFaction(faction: Faction): void {
  storeReferralContext({ faction });
}

export function loadReferralContext(): ReferralParams | null {
  const entry = readStoredReferral();
  if (!entry) return null;
  return {
    faction: entry.faction,
    ...(entry.division ? { division: entry.division } : {}),
    ...(entry.weekly ? { weekly: entry.weekly } : {}),
    ...(entry.event ? { event: entry.event } : {}),
    ...(entry.rival ? { rival: entry.rival } : {}),
  };
}

export function loadReferralFaction(): Faction | null {
  return loadReferralContext()?.faction ?? null;
}

export function clearReferralContext(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearReferralFaction(): void {
  clearReferralContext();
}

export function buildReferralUrl(baseUrl: string, params: ReferralParams | Faction): string {
  const context: ReferralParams = typeof params === 'string' ? { faction: params } : params;
  const url = new URL(baseUrl);
  url.searchParams.set('faction', context.faction);
  if (context.division) url.searchParams.set('division', context.division);
  if (context.weekly) url.searchParams.set('weekly', context.weekly);
  if (context.event) url.searchParams.set('event', context.event);
  if (context.rival) url.searchParams.set('rival', context.rival);
  return url.toString();
}

export function buildReferralShareCopy(params: ReferralParams): {
  titleKey: 'contextual' | 'default';
  textKey: 'contextual' | 'default';
  titleParams: Record<string, string>;
  textParams: Record<string, string>;
} {
  const factionName = params.faction.replace('_', ' ').toUpperCase();
  const divisionName = params.division?.toUpperCase() ?? '';
  const weeklyLabel = params.weekly ?? '';

  if (params.division || params.weekly) {
    return {
      titleKey: 'contextual',
      textKey: 'contextual',
      titleParams: { faction: factionName, division: divisionName, weekly: weeklyLabel },
      textParams: { faction: factionName, division: divisionName, weekly: weeklyLabel },
    };
  }

  return {
    titleKey: 'default',
    textKey: 'default',
    titleParams: { faction: factionName },
    textParams: { faction: factionName },
  };
}
