import { z } from 'zod';

export const AI_REVIEW_TIERS = ['green', 'orange', 'red'] as const;
export type AiReviewTier = (typeof AI_REVIEW_TIERS)[number];

export const aiReviewResponseSchema = z.object({
  tier: z.enum(AI_REVIEW_TIERS),
  summary: z.string().trim().min(1).max(500),
});

export type AiReviewPayload = z.infer<typeof aiReviewResponseSchema>;

export function parseAiReviewPayload(raw: unknown): AiReviewPayload {
  return aiReviewResponseSchema.parse(raw);
}
