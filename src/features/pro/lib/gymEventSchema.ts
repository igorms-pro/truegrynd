import { z } from 'zod';

import {
  buildCreateChallengeSchema,
  type CreateChallengeFormValues,
} from '@/features/challenges/lib/createChallengeSchema';

/** Reuses the B2C challenge builder (circuit + scoring) and adds the event window. */
export type GymEventFormValues = CreateChallengeFormValues & {
  startsAt: string;
  endsAt: string;
};

export const GYM_EVENT_DEFAULT_VALUES: GymEventFormValues = {
  title: '',
  description: '',
  rulesDetail: '',
  circuitBlocks: [{ label: '', kind: 'reps', amount: '', movementSlug: '' }],
  scoringMode: 'for_time',
  amrapCap: '',
  forTimeCap: '',
  equipmentTagsRaw: '',
  variants: ['standard'],
  startsAt: '',
  endsAt: '',
};

export function buildGymEventSchema(t: (key: string) => string, tWindow: (key: string) => string) {
  return z
    .intersection(
      buildCreateChallengeSchema(t),
      z.object({
        startsAt: z.string().min(1, { message: tWindow('startsRequired') }),
        endsAt: z.string().min(1, { message: tWindow('endsRequired') }),
      }),
    )
    .superRefine((data, ctx) => {
      if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: tWindow('endsAfterStart'),
          path: ['endsAt'],
        });
      }
    });
}
