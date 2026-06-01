import { describe, expect, it } from 'vitest';

import { buildCreateRivalMatchSchema } from '@/features/rivals/lib/createRivalMatchSchema';

const t = (key: string) => key;

describe('buildCreateRivalMatchSchema', () => {
  const schema = buildCreateRivalMatchSchema(t);

  it('accepts a valid 1v1 payload', () => {
    const result = schema.safeParse({
      challengeIds: ['11111111-1111-4111-8111-111111111111'],
      durationHours: 24,
      inviteeUsername: 'rival_one',
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty challenge selection', () => {
    const result = schema.safeParse({
      challengeIds: [],
      durationHours: 168,
      inviteeUsername: 'rival_one',
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than three challenges', () => {
    const result = schema.safeParse({
      challengeIds: [
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '33333333-3333-4333-8333-333333333333',
        '44444444-4444-4444-8444-444444444444',
      ],
      durationHours: 24,
      inviteeUsername: 'rival_one',
    });

    expect(result.success).toBe(false);
  });
});
