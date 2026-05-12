'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';

function creatorLabel(row: PendingRow): string {
  return row.creator?.username?.trim() || '—';
}

type Props = {
  row: PendingRow;
  submittedLabel: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onApproveRow: (id: string) => void | Promise<void>;
  onRejectRow: (id: string) => void;
  busyId: string | null;
};

export function AdminPendingChallengeRow({
  row,
  submittedLabel,
  checked,
  onToggle,
  onApproveRow,
  onRejectRow,
  busyId,
}: Props) {
  const t = useTranslations('admin.queue');
  const disabled = busyId !== null;
  const onApprove = useCallback(() => {
    void onApproveRow(row.id);
  }, [onApproveRow, row.id]);
  const onReject = useCallback(() => {
    onRejectRow(row.id);
  }, [onRejectRow, row.id]);
  const onCheckboxChange = useCallback(() => {
    onToggle(row.id);
  }, [onToggle, row.id]);

  return (
    <tr className="border-b border-border">
      <td className="py-3 pr-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckboxChange}
          disabled={disabled}
          aria-label={t('selectRow', { title: row.title })}
          className="h-4 w-4 accent-primary"
        />
      </td>
      <td className="py-3 pr-2 text-sm font-semibold">{row.title}</td>
      <td className="py-3 pr-2 text-xs uppercase text-muted-foreground">{row.score_type}</td>
      <td className="py-3 pr-2 text-xs text-muted-foreground">{creatorLabel(row)}</td>
      <td className="py-3 pr-2 text-xs text-muted-foreground">{submittedLabel}</td>
      <td className="py-3 text-right">
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled}
          className="mr-2 rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-wider hover:bg-muted disabled:opacity-50"
        >
          {t('approve')}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className="rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          {t('reject')}
        </button>
      </td>
    </tr>
  );
}
