'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRequireAppAccess } from '@/features/appshell';
import { getChallengeById } from '@/lib/challenges';
import { formatTopPercent, getRankCounts, percentileFromCounts } from '@/lib/rank';
import { getScoreById } from '@/features/finisher-card/services/scores';
import type { Challenge, Faction, Score } from '@/lib/types/database.types';

type Params = {
  challengeId: string | null;
  scoreId: string | null;
  ranked: boolean;
};

export type FinisherCardState =
  | { status: 'gated' }
  | { status: 'missing_params' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      score: Score;
      challenge: Challenge;
      topPercent: number | null;
      username: string;
      faction: Faction;
    };

type InnerState = Exclude<FinisherCardState, { status: 'gated' } | { status: 'missing_params' }>;

async function loadTopPercent(
  ranked: boolean,
  score: Score,
  challenge: Challenge,
): Promise<number | null> {
  if (!ranked || !score.is_validated) return null;
  try {
    const counts = await getRankCounts({
      challengeId: score.challenge_id,
      scoreType: challenge.score_type,
      value: score.value,
    });
    const pct = percentileFromCounts(counts.total, counts.better);
    return pct ? formatTopPercent(pct.percentile) : null;
  } catch {
    return null;
  }
}

export function useFinisherCard(params: Params): FinisherCardState & { retry: () => void } {
  const access = useRequireAppAccess();
  const [state, setState] = useState<InnerState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  const hasParams = !!params.challengeId && !!params.scoreId;
  const userId = access.status === 'ready' ? access.profile.id : null;

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (access.status !== 'ready') return undefined;
    if (!hasParams || !userId) return undefined;

    let cancelled = false;

    void (async () => {
      setState({ status: 'loading' });

      try {
        const score = await getScoreById(params.scoreId!);
        if (cancelled) return;

        if (!score || score.user_id !== userId) {
          setState({ status: 'error', message: 'not_found' });
          return;
        }

        if (score.challenge_id !== params.challengeId) {
          setState({ status: 'error', message: 'not_found' });
          return;
        }

        const challenge = await getChallengeById(params.challengeId!);
        if (cancelled) return;

        if (!challenge) {
          setState({ status: 'error', message: 'not_found' });
          return;
        }

        const topPercent = await loadTopPercent(params.ranked, score, challenge);
        if (cancelled) return;

        const { username, faction } = access.profile;
        if (!username || !faction) {
          setState({ status: 'error', message: 'profile_incomplete' });
          return;
        }

        setState({ status: 'ready', score, challenge, topPercent, username, faction });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) setState({ status: 'error', message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    access.status,
    access.profile,
    hasParams,
    params.challengeId,
    params.ranked,
    params.scoreId,
    reloadKey,
    userId,
  ]);

  const cardState = useMemo((): FinisherCardState => {
    if (access.status !== 'ready') return { status: 'gated' };
    if (!hasParams) return { status: 'missing_params' };
    return state;
  }, [access.status, hasParams, state]);

  return useMemo(() => ({ ...cardState, retry }), [cardState, retry]);
}
