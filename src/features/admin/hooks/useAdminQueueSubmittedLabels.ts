'use client';

import { useMemo } from 'react';

import type { AdminPendingChallenge } from '@/features/admin/services/adminChallenges';

export type RowWithSubmittedLabel = {
  row: AdminPendingChallenge;
  submittedLabel: string;
};

export function useAdminQueueSubmittedLabels(
  rows: AdminPendingChallenge[],
  locale: string,
): RowWithSubmittedLabel[] {
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'short' }), [locale]);
  return useMemo(
    () =>
      rows.map((row) => ({
        row,
        submittedLabel: dateFmt.format(new Date(row.created_at)),
      })),
    [dateFmt, rows],
  );
}
