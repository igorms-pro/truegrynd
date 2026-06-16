'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { FinisherCardLabels } from '@/lib/finisher';

/**
 * Resolves the localized strings painted on the finisher card canvas. The draw
 * function stays locale-agnostic; the React layer feeds it translated labels.
 */
export function useFinisherCardLabels(): FinisherCardLabels {
  const t = useTranslations('finisher');
  return useMemo(
    () => ({
      metricTime: t('cardMetricTime'),
      metricReps: t('cardMetricReps'),
      saved: t('cardSaved'),
      ranked: t('cardRanked'),
      top: t('cardTop'),
      subNoVideo: t('cardSubNoVideo'),
      subValidated: t('cardSubValidated'),
      subWorldwide: t('cardSubWorldwide'),
    }),
    [t],
  );
}
