'use client';

import { useTranslations } from 'next-intl';

import { AdminPendingChallengeRow } from '@/features/admin/components/AdminPendingChallengeRow';
import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';

type RowWithLabel = {
  row: PendingRow;
  submittedLabel: string;
};

type Props = {
  rowsWithLabels: RowWithLabel[];
  selected: Set<string>;
  busyId: string | null;
  onToggle: (id: string) => void;
  onApproveRow: (id: string) => void;
  onRejectRow: (id: string) => void;
};

export function AdminPendingChallengesTable({
  rowsWithLabels,
  selected,
  busyId,
  onToggle,
  onApproveRow,
  onRejectRow,
}: Props) {
  const t = useTranslations('admin.queue');

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            <th className="py-2 pr-2 w-10" scope="col">
              {' '}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colTitle')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colType')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colCreator')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colSubmitted')}
            </th>
            <th className="py-2 text-right" scope="col">
              {t('colActions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowsWithLabels.map(({ row, submittedLabel }) => (
            <AdminPendingChallengeRow
              key={row.id}
              row={row}
              submittedLabel={submittedLabel}
              checked={selected.has(row.id)}
              onToggle={onToggle}
              onApproveRow={onApproveRow}
              onRejectRow={onRejectRow}
              busyId={busyId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
