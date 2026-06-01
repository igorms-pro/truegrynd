import { z } from 'zod';

import type { Sex } from '@/lib/types/database.types';

export const SEX_OPTIONS = ['male', 'female', 'other'] as const satisfies readonly Sex[];

export type PassportFormValues = {
  username: string;
  sex: Sex;
  age: number;
  weightKg: number;
};

export function createPassportSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(2, { message: t('errors.usernameMinLength') })
      .max(24),
    sex: z.enum(SEX_OPTIONS, { message: t('errors.sexRequired') }),
    age: z
      .number()
      .int()
      .min(16, { message: t('errors.ageMin') })
      .max(100, { message: t('errors.ageMax') }),
    weightKg: z
      .number()
      .min(30, { message: t('errors.weightMin') })
      .max(300, { message: t('errors.weightMax') }),
  });
}
