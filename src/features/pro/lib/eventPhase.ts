export type EventPhase = 'upcoming' | 'live' | 'ended';

/** Derive an event's live phase from its window. */
export function eventPhase(startsAt: string, endsAt: string): EventPhase {
  const now = Date.now();
  if (now < new Date(startsAt).getTime()) return 'upcoming';
  if (now > new Date(endsAt).getTime()) return 'ended';
  return 'live';
}
