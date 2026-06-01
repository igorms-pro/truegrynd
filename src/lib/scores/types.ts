import type { ScoreType, ProofLevel } from '@/lib/types/database.types';

export type UserScoreItem = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  scoreType: ScoreType;
  value: number;
  isValidated: boolean;
  proofLevel: ProofLevel;
  isHidden: boolean;
  videoUrl: string | null;
  isOfficial: boolean;
  topPercent: number | null;
  submittedAt: string;
};
