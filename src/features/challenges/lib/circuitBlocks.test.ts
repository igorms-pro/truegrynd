import { describe, expect, it } from 'vitest';

import {
  buildFullChallengeRules,
  buildScoringPreamble,
  combineChallengeRules,
  isValidHoldTime,
} from '@/features/challenges/lib/circuitBlocks';

describe('isValidHoldTime', () => {
  it('accepts MM:SS', () => {
    expect(isValidHoldTime('3:00')).toBe(true);
    expect(isValidHoldTime('0:45')).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(isValidHoldTime('3:60')).toBe(false);
    expect(isValidHoldTime('abc')).toBe(false);
  });
});

describe('combineChallengeRules', () => {
  it('merges circuit and detail', () => {
    const out = combineChallengeRules(
      [
        { label: 'Burpees', kind: 'reps', amount: '10' },
        { label: 'Plank', kind: 'hold', amount: '3:00' },
      ],
      'Chest to floor. Straight line.',
    );
    expect(out).toContain('10 reps');
    expect(out).toContain('3:00 hold');
    expect(out).toContain('Chest to floor');
  });

  it('allows detail-only', () => {
    expect(combineChallengeRules([], 'x'.repeat(50))).toBe('x'.repeat(50));
  });
});

describe('buildScoringPreamble', () => {
  it('for time block', () => {
    expect(
      buildScoringPreamble({ mode: 'for_time', amrapCap: '', forTimeFinishCap: '' }),
    ).toContain('FOR TIME');
  });

  it('for time with finish cap', () => {
    const out = buildScoringPreamble({ mode: 'for_time', amrapCap: '', forTimeFinishCap: '15:00' });
    expect(out).toContain('FINISH UNDER: 15:00');
  });

  it('amrap includes cap', () => {
    expect(
      buildScoringPreamble({ mode: 'amrap', amrapCap: '10:00', forTimeFinishCap: '' }),
    ).toContain('AMRAP');
    expect(
      buildScoringPreamble({ mode: 'amrap', amrapCap: '10:00', forTimeFinishCap: '' }),
    ).toContain('CAP: 10:00');
  });
});

describe('buildFullChallengeRules', () => {
  it('prepends scoring then circuit', () => {
    const out = buildFullChallengeRules({
      scoringMode: 'amrap',
      amrapCap: '10:00',
      forTimeFinishCap: '',
      circuitBlocks: [{ label: 'Squats', kind: 'reps', amount: '30' }],
      rulesDetail: 'y'.repeat(45),
    });
    expect(out).toContain('FORMAT: AMRAP');
    expect(out).toContain('CIRCUIT');
    expect(out).toContain('30 reps');
  });
});
