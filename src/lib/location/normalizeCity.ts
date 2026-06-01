/** Trim and lowercase for case-insensitive city matching on leaderboards. */
export function normalizeCity(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2) return null;
  return trimmed.toLowerCase();
}

/** Store user input with collapsed whitespace, preserving display casing. */
export function sanitizeCityInput(value: string): string | null {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2) return null;
  return trimmed;
}
