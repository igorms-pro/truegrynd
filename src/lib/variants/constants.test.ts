import { describe, expect, it } from 'vitest';

import { isChallengeVariant, pickDefaultChallengeVariant } from '@/lib/variants/constants';

describe('pickDefaultChallengeVariant', () => {
  it('prefers standard when available', () => {
    expect(pickDefaultChallengeVariant(['bodyweight', 'standard', 'savage'])).toBe('standard');
  });

  it('falls back to first variant when standard is absent', () => {
    expect(pickDefaultChallengeVariant(['bodyweight', 'savage'])).toBe('bodyweight');
  });
});

describe('isChallengeVariant', () => {
  it('accepts canonical slugs', () => {
    expect(isChallengeVariant('no_equipment')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isChallengeVariant('easy_mode')).toBe(false);
  });
});
