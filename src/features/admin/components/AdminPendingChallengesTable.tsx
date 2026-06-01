'use client';

import { useTranslations } from 'next-intl';

import { AdminPendingChallengeRow } from '@/features/admin/components/AdminPendingChallengeRow';
import type { RowWithDateLabel } from '@/features/admin/hooks/useAdminQueueRowLabels';
import type { AdminQueueTabStatus } from '@/features/admin/services/adminChallenges';

type Props = {
  locale: string;
  statusFilter: AdminQueueTabStatus;
  rowsWithLabels: RowWithDateLabel[];
  selected: Set<string>;
  busyId: string | null;
  analyzeBusyId: string | null;
  analyzeDisabled: boolean;
  onToggle: (id: string) => void;
  onApproveRow: (id: string) => void | Promise<void>;
  onRejectRow: (id: string) => void;
  onCloseRow: (id: string) => void | Promise<void>;
  onAnalyzeRow: (id: string) => void;
};

export function AdminPendingChallengesTable({
  locale,
  statusFilter,
  rowsWithLabels,
  selected,
  busyId,
  analyzeBusyId,
  analyzeDisabled,
  onToggle,
  onApproveRow,
  onRejectRow,
  onCloseRow,
  onAnalyzeRow,
}: Props) {
  const t = useTranslations('admin.queue');
  const isPendingTab = statusFilter === 'pending';
  const isArenaLiveTab = statusFilter === 'arena_live';
  const dateCol =
    statusFilter === 'pending'
      ? t('colSubmitted')
      : statusFilter === 'arena_done'
        ? t('colClosed')
        : t('colReviewed');

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[880px] text-left">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            {isPendingTab ? (
              <th className="w-10 py-2 pr-2" scope="col">
                {' '}
              </th>
            ) : null}
            <th className="py-2 pr-2" scope="col">
              {t('colTitle')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colStatus')}
            </th>
            {isPendingTab ? (
              <th className="py-2 pr-2" scope="col">
                {t('colAi')}
              </th>
            ) : null}
            <th className="py-2 pr-2" scope="col">
              {t('colType')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colVariants')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {t('colCreator')}
            </th>
            <th className="py-2 pr-2" scope="col">
              {dateCol}
            </th>
            <th className="py-2 text-right" scope="col">
              {t('colActions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rowsWithLabels.map(({ row, dateLabel }) => (
            <AdminPendingChallengeRow
              key={row.id}
              locale={locale}
              row={row}
              dateLabel={dateLabel}
              isPendingTab={isPendingTab}
              isArenaLiveTab={isArenaLiveTab}
              checked={selected.has(row.id)}
              onToggle={onToggle}
              onApproveRow={onApproveRow}
              onRejectRow={onRejectRow}
              onCloseRow={onCloseRow}
              onAnalyzeRow={onAnalyzeRow}
              busyId={busyId}
              analyzeBusyId={analyzeBusyId}
              analyzeDisabled={analyzeDisabled}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
