import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';

describe('trackEvent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('dispatches a custom analytics event', () => {
    const handler = vi.fn();
    window.addEventListener('truegrynd:analytics', handler as EventListener);

    trackEvent(ANALYTICS_EVENTS.shareReferral, { faction: 'horde' });

    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener('truegrynd:analytics', handler as EventListener);
  });
});
