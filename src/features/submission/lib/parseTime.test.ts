import { describe, expect, it } from 'vitest';

import { isValidTimeInput, parseTimeInput } from '@/features/submission/lib/parseTime';

describe('parseTimeInput', () => {
  it('parses MM:SS into seconds', () => {
    expect(parseTimeInput('00:00')).toBe(0);
    expect(parseTimeInput('00:05')).toBe(5);
    expect(parseTimeInput('02:04')).toBe(124);
    expect(parseTimeInput('62:05')).toBe(3725);
  });

  it('trims whitespace', () => {
    expect(parseTimeInput(' 01:05 ')).toBe(65);
  });

  it('rejects invalid formats', () => {
    expect(parseTimeInput('1:5')).toBeNull();
    expect(parseTimeInput('aa:bb')).toBeNull();
    expect(parseTimeInput('')).toBeNull();
  });

  it('rejects seconds >= 60', () => {
    expect(parseTimeInput('01:60')).toBeNull();
    expect(parseTimeInput('01:99')).toBeNull();
  });
});

describe('isValidTimeInput', () => {
  it('returns true for valid time strings', () => {
    expect(isValidTimeInput('12:34')).toBe(true);
  });

  it('returns false for invalid time strings', () => {
    expect(isValidTimeInput('12:99')).toBe(false);
  });
});
