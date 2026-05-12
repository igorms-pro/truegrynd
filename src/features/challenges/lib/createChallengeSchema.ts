import { z } from 'zod';

import {
  buildFullChallengeRules,
  capDurationSeconds,
  isValidHoldTime,
  type CircuitBlock,
} from '@/features/challenges/lib/circuitBlocks';

export type CreateChallengeFormValues = {
  title: string;
  description: string;
  rulesDetail: string;
  circuitBlocks: CircuitBlock[];
  scoringMode: 'for_time' | 'amrap';
  amrapCap: string;
  forTimeCap: string;
  equipmentTagsRaw: string;
};

export function buildCreateChallengeSchema(t: (key: string) => string) {
  const circuitRow = z.object({
    label: z.string().max(120),
    kind: z.enum(['reps', 'hold']),
    amount: z.string().max(32),
  });

  return z
    .object({
      title: z
        .string()
        .min(3, { message: t('titleMin') })
        .max(120, { message: t('titleMax') }),
      description: z
        .string()
        .min(20, { message: t('descriptionMin') })
        .max(1200, { message: t('descriptionMax') }),
      rulesDetail: z.string().max(8000, { message: t('rulesMax') }),
      circuitBlocks: z.array(circuitRow).max(30),
      scoringMode: z.enum(['for_time', 'amrap']),
      amrapCap: z.string().max(10),
      forTimeCap: z.string().max(10),
      equipmentTagsRaw: z.string().max(500, { message: t('tagsMax') }),
    })
    .superRefine((data, ctx) => {
      if (data.scoringMode === 'for_time') {
        const cap = data.forTimeCap.trim();
        if (cap.length > 0) {
          if (!isValidHoldTime(cap)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('forTimeCapInvalid'),
              path: ['forTimeCap'],
            });
          } else {
            const secs = capDurationSeconds(cap);
            if (secs === null || secs <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('forTimeCapZero'),
                path: ['forTimeCap'],
              });
            }
          }
        }
      }

      if (data.scoringMode === 'amrap') {
        const cap = data.amrapCap.trim();
        if (!cap) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('amrapCapMissing'),
            path: ['amrapCap'],
          });
        } else if (!isValidHoldTime(cap)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('amrapCapInvalid'),
            path: ['amrapCap'],
          });
        } else {
          const secs = capDurationSeconds(cap);
          if (secs === null || secs <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('amrapCapZero'),
              path: ['amrapCap'],
            });
          }
        }
      }

      for (let i = 0; i < data.circuitBlocks.length; i++) {
        const block = data.circuitBlocks[i];
        const label = block.label.trim();
        const amount = block.amount.trim();
        if (!label && !amount) continue;

        if (!label) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('circuitLabelMissing'),
            path: ['circuitBlocks', i, 'label'],
          });
        }
        if (!amount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('circuitAmountMissing'),
            path: ['circuitBlocks', i, 'amount'],
          });
          continue;
        }
        if (block.kind === 'reps') {
          if (!/^\d+$/.test(amount) || parseInt(amount, 10) <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('circuitRepsInvalid'),
              path: ['circuitBlocks', i, 'amount'],
            });
          }
        } else if (!isValidHoldTime(amount)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('circuitHoldInvalid'),
            path: ['circuitBlocks', i, 'amount'],
          });
        }
      }

      const combined = buildFullChallengeRules({
        scoringMode: data.scoringMode,
        amrapCap: data.amrapCap,
        forTimeFinishCap: data.forTimeCap,
        circuitBlocks: data.circuitBlocks,
        rulesDetail: data.rulesDetail,
      });
      if (combined.length < 40) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('combinedMin'),
          path: ['rulesDetail'],
        });
      }
      if (combined.length > 8000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('rulesMax'),
          path: ['rulesDetail'],
        });
      }
    });
}

export function parseEquipmentTags(raw: string): string[] {
  const parts = raw.split(/[,;\n]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const tag = part.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
    if (out.length >= 20) break;
  }
  return out;
}
