const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MIN_WEEKS_AWAY = 1;
const MAX_WEEKS_AWAY = 2.5;

export type ComebackEligibility = {
  eligible: boolean;
  weeksAway: number | null;
};

export function getComebackEligibility(
  lastActivityAt: string | null,
  nowMs: number = Date.now(),
): ComebackEligibility {
  if (!lastActivityAt) {
    return { eligible: false, weeksAway: null };
  }

  const elapsedMs = nowMs - new Date(lastActivityAt).getTime();
  if (elapsedMs < MIN_WEEKS_AWAY * MS_PER_WEEK) {
    return { eligible: false, weeksAway: null };
  }

  const weeksAway = elapsedMs / MS_PER_WEEK;
  if (weeksAway > MAX_WEEKS_AWAY) {
    return { eligible: false, weeksAway: null };
  }

  return { eligible: true, weeksAway: Math.floor(weeksAway) };
}
