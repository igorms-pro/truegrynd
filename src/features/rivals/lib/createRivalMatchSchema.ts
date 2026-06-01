import { z } from 'zod';

export type CreateRivalMatchFormValues = {
  challengeIds: string[];
  durationHours: 24 | 168;
  inviteeUsername: string;
};

export function buildCreateRivalMatchSchema(t: (key: string) => string) {
  return z.object({
    challengeIds: z.array(z.string().uuid()).min(1, t('challengesMin')).max(3, t('challengesMax')),
    durationHours: z.union([z.literal(24), z.literal(168)]),
    inviteeUsername: z.string().trim().min(2, t('usernameMin')).max(30, t('usernameMax')),
  });
}
