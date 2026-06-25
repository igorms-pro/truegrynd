export type EventPhase = 'upcoming' | 'live' | 'ended';

/** Compact event date/time for the current locale (e.g. "23 Jun, 18:00"). */
export function formatEventWindow(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Derive an event's live phase from its window. */
export function eventPhase(startsAt: string, endsAt: string): EventPhase {
  const now = Date.now();
  if (now < new Date(startsAt).getTime()) return 'upcoming';
  if (now > new Date(endsAt).getTime()) return 'ended';
  return 'live';
}
