import { z } from 'zod';

import { parseTimeInput } from '@/features/submission/lib/parseTime';
import { isAllowedVideoUrl } from '@/features/submission/lib/videoUrl';
import type { ScoreType } from '@/lib/types/database.types';

export type ScoreSubmissionFormValues = {
  time: string;
  reps: number;
  videoUrl: string;
};

export function buildScoreSubmissionSchema(
  t: (key: string) => string,
  scoreType: ScoreType,
  maxDurationSeconds: number | null,
): z.ZodObject<{
  time: z.ZodString;
  reps: z.ZodNumber;
  videoUrl: z.ZodString;
}> {
  const timeField =
    scoreType === 'time'
      ? z
          .string()
          .refine((v) => parseTimeInput(v) !== null, { message: t('errors.invalidTime') })
          .refine(
            (v) => {
              if (maxDurationSeconds === null) return true;
              const secs = parseTimeInput(v);
              return secs !== null && secs <= maxDurationSeconds;
            },
            { message: t('errors.exceedsTimeCap') },
          )
      : z.string();

  return z.object({
    time: timeField,
    reps:
      scoreType === 'reps'
        ? z
            .number()
            .int()
            .min(1, { message: t('errors.invalidReps') })
        : z.number(),
    videoUrl: z.string().refine((v) => v.trim().length === 0 || isAllowedVideoUrl(v), {
      message: t('errors.videoInvalid'),
    }),
  });
}

export function parseScoreSubmissionValue(
  values: ScoreSubmissionFormValues,
  scoreType: ScoreType,
): number | null {
  if (scoreType === 'time') return parseTimeInput(values.time);
  if (!Number.isFinite(values.reps) || values.reps < 1) return null;
  return Math.floor(values.reps);
}
