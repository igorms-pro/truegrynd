import type { ProofLevel } from '@/lib/types/database.types';

export const PROOF_LEVELS = [
  'honor',
  'video_ranked',
  'community_verified',
  'event_verified',
  'judge_verified',
] as const satisfies readonly ProofLevel[];

export type ProofMinFilter = 'video_ranked' | 'community_verified' | 'judge_verified';

const RANK: Record<ProofLevel, number> = {
  honor: 0,
  video_ranked: 1,
  community_verified: 2,
  event_verified: 3,
  judge_verified: 4,
};

export function proofLevelRank(level: ProofLevel): number {
  return RANK[level];
}

export function meetsMinProofLevel(level: ProofLevel, min: ProofMinFilter | null): boolean {
  if (!min) return level !== 'honor';
  return proofLevelRank(level) >= proofLevelRank(min);
}

export function isPrestigeProofLevel(level: ProofLevel): boolean {
  return proofLevelRank(level) >= proofLevelRank('video_ranked');
}
