'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { listChallengeCommitments } from '@/features/profile/lib/challengeCommitments';
import { enrichScoresWithTopPercent } from '@/features/profile/lib/enrichScoresWithTopPercent';
import { buildHistoryItems, filterHistoryByTab } from '@/features/profile/lib/filterHistoryByTab';
import { listMyScores } from '@/features/profile/services/scores';
import type { HistoryItem, HistoryTab } from '@/features/profile/types';

type State =
  | { status: 'loading'; data: null; error: null }
  | { status: 'error'; data: null; error: string }
  | { status: 'ready'; data: HistoryItem[]; error: null };

const initial: State = { status: 'loading', data: null, error: null };

const SCORE_FETCH_LIMIT = 100;

export function useProfileHistory(userId: string | null): {
  state: State;
  activeTab: HistoryTab;
  setActiveTab: (tab: HistoryTab) => void;
  filteredItems: HistoryItem[];
  refetch: () => void;
} {
  const [state, setState] = useState<State>(initial);
  const [activeTab, setActiveTab] = useState<HistoryTab>('all');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!userId) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const rawScores = await listMyScores(userId, SCORE_FETCH_LIMIT);
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
        const items = buildHistoryItems(scores, inProgress);
        if (!cancelled) setState({ status: 'ready', data: items, error: null });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', data: null, error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, userId]);

  const refetch = useCallback(() => {
    setState(initial);
    setReloadKey((k) => k + 1);
  }, []);

  const filteredItems = useMemo(() => {
    if (state.status !== 'ready') return [];
    return filterHistoryByTab(state.data, activeTab);
  }, [activeTab, state]);

  return { state, activeTab, setActiveTab, filteredItems, refetch };
}
