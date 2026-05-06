'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRequireAppAccess } from '@/features/appshell';
import { getApprovedChallengeById } from '@/features/challenges/services/challenges';
import { formatTopPercent, percentileFromCounts } from '@/features/finisher-card/lib/percentile';
import { getRankCounts } from '@/features/finisher-card/services/rank';
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

export function useFinisherCard(params: Params): FinisherCardState {
  const access = useRequireAppAccess();
  const [state, setState] = useState<InnerState>({ status: 'loading' });

  const hasParams = !!params.challengeId && !!params.scoreId;

  useEffect(() => {
    if (access.status !== 'ready') return undefined;
    if (!hasParams) return undefined;

    let cancelled = false;
    void (async () => {
      try {
        const [score, challenge] = await Promise.all([
          getScoreById(params.scoreId!),
          getApprovedChallengeById(params.challengeId!),
        ]);
        if (cancelled) return;
        if (!score || !challenge) {
          setState({ status: 'error', message: 'not_found' });
          return;
        }

        let topPercent: number | null = null;
        if (params.ranked && score.is_validated) {
          const counts = await getRankCounts({
            challengeId: score.challenge_id,
            scoreType: challenge.score_type,
            value: score.value,
          });
          const pct = percentileFromCounts(counts.total, counts.better);
          topPercent = pct ? formatTopPercent(pct.percentile) : null;
        }

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
  }, [access.status, access.profile, hasParams, params.challengeId, params.ranked, params.scoreId]);

  return useMemo(() => {
    if (access.status !== 'ready') return { status: 'gated' };
    if (!hasParams) return { status: 'missing_params' };
    return state;
  }, [access.status, hasParams, state]);
}
