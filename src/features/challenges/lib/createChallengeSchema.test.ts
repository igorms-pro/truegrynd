import { describe, expect, it } from 'vitest';

import {
  buildCreateChallengeSchema,
  parseEquipmentTags,
} from '@/features/challenges/lib/createChallengeSchema';

const t = (key: string) => key;

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

describe('buildCreateChallengeSchema — circuitMinBlock', () => {
  const schema = buildCreateChallengeSchema(t);

  const validBase = {
    title: 'Test challenge title',
    description: 'A valid description that is at least twenty characters long.',
    rulesDetail: 'x'.repeat(50),
    scoringMode: 'for_time' as const,
    amrapCap: '',
    forTimeCap: '',
    equipmentTagsRaw: '',
  };

  it('rejects zero valid circuit blocks', () => {
    const result = schema.safeParse({
      ...validBase,
      circuitBlocks: [{ label: '', kind: 'reps', amount: '', movementSlug: '' }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('circuitBlocks');
    }
  });

  it('accepts one valid catalog block', () => {
    const result = schema.safeParse({
      ...validBase,
      circuitBlocks: [{ label: 'Push-Up', kind: 'reps', amount: '10', movementSlug: 'push_up' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts one valid off-catalog block', () => {
    const result = schema.safeParse({
      ...validBase,
      circuitBlocks: [
        { label: 'Custom move', kind: 'reps', amount: '5', movementSlug: '__other__' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects off-catalog block with missing label', () => {
    const result = schema.safeParse({
      ...validBase,
      circuitBlocks: [{ label: '', kind: 'reps', amount: '10', movementSlug: '__other__' }],
    });
    expect(result.success).toBe(false);
  });
});
