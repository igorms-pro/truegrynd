import { describe, expect, it } from 'vitest';

import { buildFullChallengeRules } from '@/features/challenges/lib/circuitBlocks';
import { parseChallengeRules } from '@/features/challenges/lib/parseChallengeRules';

describe('parseChallengeRules', () => {
  it('parses rules built by buildFullChallengeRules', () => {
    const rules = buildFullChallengeRules({
      scoringMode: 'amrap',
      amrapCap: '10:00',
      forTimeFinishCap: '',
      circuitBlocks: [{ label: 'Burpee', kind: 'reps', amount: '10', movementSlug: 'burpee' }],
      rulesDetail: 'Full lockout at the top.',
    });

    const parsed = parseChallengeRules(rules);
    expect(parsed.scoring).toContain('AMRAP');
    expect(parsed.circuitLines).toEqual(['1. Burpee — 10 reps']);
    expect(parsed.standards).toContain('lockout');
  });

  it('handles scoring-only text', () => {
    const parsed = parseChallengeRules('SCORING\nFORMAT: FOR TIME\nFinish fast.');
    expect(parsed.scoring).toContain('FOR TIME');
    expect(parsed.circuitLines).toEqual([]);
  });
});
