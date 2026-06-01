import { describe, expect, it } from 'vitest';

import { formatReps, formatScore, formatTime } from '@/lib/scoring/formatScore';

describe('formatTime', () => {
  it('pads minutes and seconds to two digits', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(125)).toBe('02:05');
  });

  it('handles long durations beyond 60 minutes', () => {
    expect(formatTime(3725)).toBe('62:05');
  });

  it('floors fractional seconds (no rounding up)', () => {
    expect(formatTime(59.999)).toBe('00:59');
  });

  it('returns a placeholder for invalid input', () => {
    expect(formatTime(-1)).toBe('--:--');
    expect(formatTime(Number.NaN)).toBe('--:--');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('--:--');
  });
});

describe('formatReps', () => {
  it('returns localized integer string', () => {
    expect(formatReps(0)).toBe('0');
    expect(formatReps(99)).toBe('99');
  });

  it('floors decimals and protects against negatives', () => {
    expect(formatReps(12.9)).toBe('12');
    expect(formatReps(-3)).toBe('0');
  });
});

describe('formatScore', () => {
  it('routes time scores to MM:SS', () => {
    expect(formatScore(125, 'time')).toBe('02:05');
  });

  it('routes reps scores to an integer string', () => {
    expect(formatScore(42, 'reps')).toBe('42');
  });
});
