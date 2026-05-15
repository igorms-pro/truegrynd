'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  addRespect,
  getRespectCounts,
  getUserRespectedScoreIds,
  removeRespect,
} from '@/features/challenges/services/respects';

type State = {
  counts: Map<string, number>;
  respected: Set<string>;
  loading: boolean;
};

export function useScoreRespects(
  scoreIds: string[],
  userId: string | null,
): {
  counts: Map<string, number>;
  respected: Set<string>;
  loading: boolean;
  toggle: (scoreId: string) => Promise<void>;
} {
  const [state, setState] = useState<State>({
    counts: new Map(),
    respected: new Set(),
    loading: true,
  });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (scoreIds.length === 0) {
      setState({ counts: new Map(), respected: new Set(), loading: false });
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        const [counts, respected] = await Promise.all([
          getRespectCounts(scoreIds),
          userId ? getUserRespectedScoreIds(userId, scoreIds) : Promise.resolve(new Set<string>()),
        ]);
        if (!cancelled) {
          setState({ counts, respected, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreIds.join(','), userId]);

  const toggle = useCallback(
    async (scoreId: string) => {
      if (!userId || busyId) return;
      setBusyId(scoreId);

      const wasRespected = state.respected.has(scoreId);

      setState((prev) => {
        const nextRespected = new Set(prev.respected);
        const nextCounts = new Map(prev.counts);
        const current = nextCounts.get(scoreId) ?? 0;

        if (wasRespected) {
          nextRespected.delete(scoreId);
          nextCounts.set(scoreId, Math.max(0, current - 1));
        } else {
          nextRespected.add(scoreId);
          nextCounts.set(scoreId, current + 1);
        }

        return { ...prev, counts: nextCounts, respected: nextRespected };
      });

      try {
        if (wasRespected) {
          await removeRespect(scoreId, userId);
        } else {
          await addRespect(scoreId, userId);
        }
      } catch {
        setState((prev) => {
          const nextRespected = new Set(prev.respected);
          const nextCounts = new Map(prev.counts);
          const current = nextCounts.get(scoreId) ?? 0;

          if (wasRespected) {
            nextRespected.add(scoreId);
            nextCounts.set(scoreId, current + 1);
          } else {
            nextRespected.delete(scoreId);
            nextCounts.set(scoreId, Math.max(0, current - 1));
          }

          return { ...prev, counts: nextCounts, respected: nextRespected };
        });
      } finally {
        setBusyId(null);
      }
    },
    [busyId, state.respected, userId],
  );

  return {
    counts: state.counts,
    respected: state.respected,
    loading: state.loading,
    toggle,
  };
}
