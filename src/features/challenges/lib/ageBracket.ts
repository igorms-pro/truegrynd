export type AgeBracket = '18-29' | '30-39' | '40-49' | '50+';

export const AGE_BRACKETS: readonly AgeBracket[] = ['18-29', '30-39', '40-49', '50+'] as const;

export function ageBracketFromAge(age: number | null): AgeBracket | null {
  if (age == null || age < 18) return null;
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  return '50+';
}

export function isInBracket(age: number | null, bracket: AgeBracket | null): boolean {
  if (!bracket) return true;
  return ageBracketFromAge(age) === bracket;
}
