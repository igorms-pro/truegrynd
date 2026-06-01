import type { Division } from '@/lib/types/database.types';

export const DIVISIONS: readonly Division[] = ['rookie', 'regular', 'savage', 'elite'] as const;

export const DEFAULT_DIVISION: Division = 'rookie';

export function isDivision(value: string): value is Division {
  return (DIVISIONS as readonly string[]).includes(value);
}
