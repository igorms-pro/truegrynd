import type { AnalyticsEventName } from '@/lib/analytics/events';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

const DISTINCT_ID_KEY = 'tg_analytics_distinct_id';

function getDistinctId(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    const existing = localStorage.getItem(DISTINCT_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(DISTINCT_ID_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

export function trackEvent(name: AnalyticsEventName, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('truegrynd:analytics', { detail: { name, properties: properties ?? {} } }),
  );

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
  if (!apiKey) return;

  void fetch(`${host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      event: name,
      distinct_id: getDistinctId(),
      properties: { ...properties, source: 'web' },
    }),
    keepalive: true,
  }).catch(() => {
    /* analytics must not break UX */
  });
}
