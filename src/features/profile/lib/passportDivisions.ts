import type { Division } from '@/lib/types/database.types';

/** Divisions ever recorded in rating history plus current profile division. */
export function divisionsReached(
  current: Division,
  history: readonly { division: Division }[],
): Division[] {
  const order: Division[] = ['rookie', 'regular', 'savage', 'elite'];
  const seen = new Set<Division>([current]);
  for (const entry of history) {
    seen.add(entry.division);
  }
  return order.filter((d) => seen.has(d));
}
