'use client';

import { useCallback, useState } from 'react';

import {
  buildFullChallengeRules,
  capDurationSeconds,
} from '@/features/challenges/lib/circuitBlocks';
import {
  parseEquipmentTags,
  type CreateChallengeFormValues,
} from '@/features/challenges/lib/createChallengeSchema';
import { createPendingChallenge } from '@/features/challenges/services/challenges';
import { supabase } from '@/lib/supabase';
import type { Challenge } from '@/lib/types/database.types';

type CreateErrorKey = 'errors.auth' | 'errors.generic';

export function useCreateChallenge(): {
  busy: boolean;
  errorKey: CreateErrorKey | null;
  submit: (values: CreateChallengeFormValues) => Promise<Challenge>;
  clearError: () => void;
} {
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<CreateErrorKey | null>(null);

  const clearError = useCallback(() => setErrorKey(null), []);

  const submit = useCallback(async (values: CreateChallengeFormValues) => {
    setBusy(true);
    setErrorKey(null);
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        setErrorKey('errors.auth');
        throw new Error('auth_required');
      }
      const tags = parseEquipmentTags(values.equipmentTagsRaw ?? '');
      const rules = buildFullChallengeRules({
        scoringMode: values.scoringMode,
        amrapCap: values.amrapCap,
        forTimeFinishCap: values.forTimeCap,
        circuitBlocks: values.circuitBlocks,
        rulesDetail: values.rulesDetail,
      });
      const scoreType = values.scoringMode === 'for_time' ? 'time' : 'reps';
      let maxDurationSeconds: number | null = null;
      if (values.scoringMode === 'for_time') {
        const secs = capDurationSeconds(values.forTimeCap ?? '');
        if (secs !== null && secs > 0) maxDurationSeconds = secs;
      }
      return await createPendingChallenge({
        creatorId: data.user.id,
        title: values.title,
        description: values.description,
        rules,
        scoreType,
        equipmentTags: tags,
        maxDurationSeconds,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      if (message !== 'auth_required') {
        setErrorKey('errors.generic');
      }
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, errorKey, submit, clearError };
}
