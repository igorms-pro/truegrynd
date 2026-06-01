import type { ScoreType } from '@/lib/types/database.types';

export type UserScoreItem = {
  id: string;
  challengeId: string;
  challengeTitle: string;
  scoreType: ScoreType;
  value: number;
  isValidated: boolean;
  isHidden: boolean;
  videoUrl: string | null;
  isOfficial: boolean;
  topPercent: number | null;
  submittedAt: string;
};
