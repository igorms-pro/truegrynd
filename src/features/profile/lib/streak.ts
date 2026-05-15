/**
 * Compute the next streak value given the last activity date and today's date.
 * All dates are compared as calendar days (UTC).
 */
export function computeStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  todayIso: string,
): { streak: number; changed: boolean } {
  const today = stripTime(todayIso);

  if (!lastActivityDate) {
    return { streak: 1, changed: true };
  }

  const last = stripTime(lastActivityDate);

  if (last === today) {
    return { streak: currentStreak, changed: false };
  }

  const diffDays = daysBetween(last, today);

  if (diffDays === 1) {
    return { streak: currentStreak + 1, changed: true };
  }

  return { streak: 1, changed: true };
}

function stripTime(iso: string): string {
  return iso.slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msA = new Date(a + 'T00:00:00Z').getTime();
  const msB = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((msB - msA) / 86_400_000);
}
