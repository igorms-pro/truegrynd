/** ISO 3166-1 alpha-2 codes supported in passport settings (expand as needed). */
export const COUNTRY_CODES = [
  'FR',
  'BE',
  'CH',
  'CA',
  'US',
  'GB',
  'DE',
  'ES',
  'IT',
  'NL',
  'PT',
  'MA',
  'DZ',
  'TN',
  'SN',
  'CI',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export function isCountryCode(value: string): value is CountryCode {
  return (COUNTRY_CODES as readonly string[]).includes(value);
}

export function normalizeCountryCode(value: string | null | undefined): string | null {
  if (value == null) return null;
  const upper = value.trim().toUpperCase();
  if (upper.length !== 2) return null;
  return isCountryCode(upper) ? upper : null;
}

export function getCountryLabel(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
