import { describe, expect, it } from 'vitest';

import { parseAiReviewPayload } from '@/features/admin/lib/aiReviewSchema';

describe('parseAiReviewPayload', () => {
  it('accepts valid tier + summary', () => {
    expect(
      parseAiReviewPayload({
        tier: 'orange',
        summary: 'Standard push-up challenge; rules are clear.',
      }),
    ).toEqual({
      tier: 'orange',
      summary: 'Standard push-up challenge; rules are clear.',
    });
  });

  it('rejects invalid tier', () => {
    expect(() => parseAiReviewPayload({ tier: 'blue', summary: 'x'.repeat(20) })).toThrow();
  });
});
