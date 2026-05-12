import { describe, expect, it } from 'vitest';

import { parseEquipmentTags } from '@/features/challenges/lib/createChallengeSchema';

describe('parseEquipmentTags', () => {
  it('splits comma list and lowercases', () => {
    expect(parseEquipmentTags('Kettlebell, Pull-Up Bar')).toEqual(['kettlebell', 'pull-up bar']);
  });

  it('dedupes tags', () => {
    expect(parseEquipmentTags('band, band, rope')).toEqual(['band', 'rope']);
  });

  it('caps at 20 tags', () => {
    const raw = Array.from({ length: 30 }, (_, i) => `item${i}`).join(', ');
    expect(parseEquipmentTags(raw)).toHaveLength(20);
  });
});
