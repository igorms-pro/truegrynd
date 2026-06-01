'use client';

import { useCallback, useEffect, useState } from 'react';

import { listApprovedChallenges } from '@/features/challenges/services/challenges';
import { type CreateRivalMatchFormValues } from '@/features/rivals/lib/createRivalMatchSchema';
import { mapRivalErrorKey } from '@/features/rivals/lib/mapRivalErrorKey';
import { createRivalMatch } from '@/features/rivals/services/rivalMatches';
import type { Challenge } from '@/lib/types/database.types';

type State = {
  challenges: Challenge[];
  loadingChallenges: boolean;
  challengesError: string | null;
  busy: boolean;
  errorKey: string | null;
};

const initial: State = {
  challenges: [],
  loadingChallenges: true,
  challengesError: null,
  busy: false,
  errorKey: null,
};

export function useCreateRivalMatch(): {
  challenges: Challenge[];
  loadingChallenges: boolean;
  challengesError: string | null;
  busy: boolean;
  errorKey: string | null;
  submit: (values: CreateRivalMatchFormValues) => Promise<string>;
  clearError: () => void;
  reloadChallenges: () => void;
} {
  const [state, setState] = useState<State>(initial);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const challenges = await listApprovedChallenges();
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            challenges,
            loadingChallenges: false,
            challengesError: null,
          }));
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loadingChallenges: false,
            challengesError: message,
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, errorKey: null }));
  }, []);

  const reloadChallenges = useCallback(() => {
    setState((prev) => ({ ...prev, loadingChallenges: true, challengesError: null }));
    setReloadKey((key) => key + 1);
  }, []);

  const submit = useCallback(async (values: CreateRivalMatchFormValues): Promise<string> => {
    setState((prev) => ({ ...prev, busy: true, errorKey: null }));
    try {
      const matchId = await createRivalMatch({
        challengeIds: values.challengeIds,
        durationHours: values.durationHours,
        inviteeUsername: values.inviteeUsername.trim(),
      });
      return matchId;
    } catch (e: unknown) {
      setState((prev) => ({ ...prev, errorKey: mapRivalErrorKey(e) }));
      throw e;
    } finally {
      setState((prev) => ({ ...prev, busy: false }));
    }
  }, []);

  return {
    challenges: state.challenges,
    loadingChallenges: state.loadingChallenges,
    challengesError: state.challengesError,
    busy: state.busy,
    errorKey: state.errorKey,
    submit,
    clearError,
    reloadChallenges,
  };
}
