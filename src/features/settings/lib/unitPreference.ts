export type UnitSystem = 'metric' | 'imperial';

const STORAGE_KEY = 'tg-unit-system';

export function readUnitPreference(): UnitSystem {
  if (typeof window === 'undefined') return 'metric';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'imperial' ? 'imperial' : 'metric';
  } catch {
    return 'metric';
  }
}

export function writeUnitPreference(value: UnitSystem): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore localStorage failures
  }
}
