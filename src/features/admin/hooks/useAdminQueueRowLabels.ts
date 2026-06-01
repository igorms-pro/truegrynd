'use client';

import { useMemo } from 'react';

import type {
  AdminPendingChallenge,
  AdminQueueTabStatus,
} from '@/features/admin/services/adminChallenges';

export type RowWithDateLabel = {
  row: AdminPendingChallenge;
  dateLabel: string;
};

export function useAdminQueueRowLabels(
  rows: AdminPendingChallenge[],
  locale: string,
  statusFilter: AdminQueueTabStatus,
): RowWithDateLabel[] {
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'short' }), [locale]);

  return useMemo(
    () =>
      rows.map((row) => {
        const raw =
          statusFilter === 'pending'
            ? row.created_at
            : statusFilter === 'arena_done'
              ? (row.ends_at ?? row.reviewed_at ?? row.created_at)
              : (row.reviewed_at ?? row.created_at);
        return {
          row,
          dateLabel: dateFmt.format(new Date(raw)),
        };
      }),
    [dateFmt, rows, statusFilter],
  );
}
