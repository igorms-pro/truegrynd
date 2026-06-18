'use client';

import { useMemo, useState } from 'react';

import { listChallengeCommitments } from '@/features/profile/lib/challengeCommitments';
import { enrichScoresWithTopPercent } from '@/features/profile/lib/enrichScoresWithTopPercent';
import { buildHistoryItems, filterHistoryByTab } from '@/features/profile/lib/filterHistoryByTab';
import { listMyScores } from '@/features/profile/services/scores';
import type { HistoryItem, HistoryTab } from '@/features/profile/types';
import { useAsyncResource } from '@/hooks/useAsyncResource';

type State =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'ready'; data: HistoryItem[]; error: null };

const SCORE_FETCH_LIMIT = 100;

export function useProfileHistory(userId: string | null): {
  state: State;
  activeTab: HistoryTab;
  setActiveTab: (tab: HistoryTab) => void;
  filteredItems: HistoryItem[];
  refetch: () => void;
} {
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');

  const { state: resource, refetch } = useAsyncResource<HistoryItem[]>(
    async () => {
      const rawScores = await listMyScores(userId as string, SCORE_FETCH_LIMIT);
      const enriched = await enrichScoresWithTopPercent(rawScores);
      const scoreChallengeIds = new Set(enriched.map((s) => s.challengeId));
      const commitments = listChallengeCommitments().filter(
        (c) => !scoreChallengeIds.has(c.challengeId),
      );
      const scores = enriched.map((s) => ({ ...s, kind: 'score' as const }));
      const inProgress = commitments.map((c) => ({
        kind: 'in_progress' as const,
        challengeId: c.challengeId,
        challengeTitle: c.challengeTitle,
        committedAt: c.committedAt,
      }));
      return buildHistoryItems(scores, inProgress);
    },
    [userId],
    { enabled: userId !== null },
  );

  const state = useMemo<State>(() => {
    if (resource.status === 'ready') return { status: 'ready', data: resource.data, error: null };
    if (resource.status === 'error')
      return { status: 'error', data: null, error: resource.message };
    return { status: 'loading', data: null, error: null };
  }, [resource]);

  const filteredItems = useMemo(() => {
    if (state.status !== 'ready') return [];
    return filterHistoryByTab(state.data, activeTab);
  }, [activeTab, state]);

  return { state, activeTab, setActiveTab, filteredItems, refetch };
}
