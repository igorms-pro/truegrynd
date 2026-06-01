import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';

const FIRST_SCORE_KEY = 'tg_analytics_first_score';

export function trackFirstScoreIfNeeded(ranked: boolean): void {
  if (!ranked || typeof window === 'undefined') return;
  try {
    if (localStorage.getItem(FIRST_SCORE_KEY)) return;
    localStorage.setItem(FIRST_SCORE_KEY, '1');
    trackEvent(ANALYTICS_EVENTS.firstScoreSubmitted);
  } catch {
    /* ignore */
  }
}

export function resetFirstScoreTrackingForTests(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FIRST_SCORE_KEY);
}
