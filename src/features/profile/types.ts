import type { ScoreType } from '@/lib/types/database.types';

export type HistoryTab = 'all' | 'in_progress' | 'validated' | 'saved' | 'won';

export type ProfileScoreItem = {
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

export type HistoryScoreItem = ProfileScoreItem & { kind: 'score' };

export type HistoryInProgressItem = {
  kind: 'in_progress';
  challengeId: string;
  challengeTitle: string;
  committedAt: string;
};

export type HistoryItem = HistoryScoreItem | HistoryInProgressItem;

export const PROFILE_CARD_PREVIEW_LIMIT = 4;

export const HISTORY_TABS: HistoryTab[] = ['all', 'in_progress', 'validated', 'saved', 'won'];
