import type { AnalyticsEventName } from '@/lib/analytics/events';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

const DISTINCT_ID_KEY = 'tg_analytics_distinct_id';
const LIB = 'truegrynd-web';

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

function resolvePostHog(): { apiKey: string; host: string } | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';
  return { apiKey, host };
}

function capture(body: Record<string, unknown>): void {
  const cfg = resolvePostHog();
  if (!cfg) return;
  void fetch(`${cfg.host}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: cfg.apiKey, ...body }),
    keepalive: true,
  }).catch(() => {
    /* analytics must not break UX */
  });
}

export function trackEvent(name: AnalyticsEventName, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('truegrynd:analytics', { detail: { name, properties: properties ?? {} } }),
  );

  capture({
    event: name,
    distinct_id: getDistinctId(),
    properties: {
      ...properties,
      source: 'web',
      $lib: LIB,
      $current_url: window.location.href,
    },
  });
}

/**
 * Tie the anonymous distinct id to the authenticated user so events stitch into
 * real per-person funnels (signup → first score → share). Idempotent: a no-op
 * once already identified to this user. Call on login / session restore.
 */
export function identifyUser(userId: string, setProps?: EventProperties): void {
  if (typeof window === 'undefined' || !userId) return;
  if (!resolvePostHog()) return;

  let anonId = '';
  try {
    anonId = localStorage.getItem(DISTINCT_ID_KEY) ?? '';
  } catch {
    anonId = '';
  }
  if (anonId === userId) return; // already identified to this user

  capture({
    event: '$identify',
    distinct_id: userId,
    properties: {
      $anon_distinct_id: anonId || undefined,
      $set: { ...setProps },
      $lib: LIB,
      source: 'web',
    },
  });

  try {
    localStorage.setItem(DISTINCT_ID_KEY, userId);
  } catch {
    /* ignore */
  }
}

/** Drop the identified id on logout so a fresh anonymous id is minted next time. */
export function resetAnalyticsIdentity(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DISTINCT_ID_KEY);
  } catch {
    /* ignore */
  }
}
