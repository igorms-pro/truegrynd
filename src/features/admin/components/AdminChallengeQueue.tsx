'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminPendingChallengeRow } from '@/features/admin/components/AdminPendingChallengeRow';
import { AdminQueueBatchToolbar } from '@/features/admin/components/AdminQueueBatchToolbar';
import { AdminRejectModal } from '@/features/admin/components/AdminRejectModal';
import { useAdminPendingChallenges } from '@/features/admin/hooks/useAdminPendingChallenges';
import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';

export function AdminChallengeQueue() {
  const t = useTranslations('admin.queue');
  const tErr = useTranslations('admin.errors');
  const locale = useLocale();
  const { state, approveOne, batchApprove, rejectOne } = useAdminPendingChallenges();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingRow | null>(null);

  const rows = state.rows;
  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const dateFmt = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: 'short' }), [locale]);
  const rowsWithLabels = useMemo(
    () =>
      rows.map((row) => ({
        row,
        submittedLabel: dateFmt.format(new Date(row.created_at)),
      })),
    [dateFmt, rows],
  );

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(allIds));
  }, [allIds]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const handleApproveRow = useCallback(
    async (id: string) => {
      setActionError(null);
      setBusyId(id);
      try {
        await approveOne(id);
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'unknown';
        setActionError(`${tErr('actionFailed')} (${message})`);
      } finally {
        setBusyId(null);
      }
    },
    [approveOne, tErr],
  );

  const handleBatchApprove = useCallback(async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setActionError(null);
    setBatchBusy(true);
    try {
      await batchApprove(ids);
      clearSelection();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setActionError(`${tErr('actionFailed')} (${message})`);
    } finally {
      setBatchBusy(false);
    }
  }, [batchApprove, clearSelection, selected, tErr]);

  const handleBatchApproveClick = useCallback(() => {
    void handleBatchApprove();
  }, [handleBatchApprove]);

  const openReject = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id) ?? null;
      setRejectTarget(row);
    },
    [rows],
  );

  const handleModalClose = useCallback(() => {
    setRejectTarget(null);
  }, []);

  const handleConfirmReject = useCallback(
    async (reason: string) => {
      if (!rejectTarget) return;
      await rejectOne(rejectTarget.id, reason);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(rejectTarget.id);
        return next;
      });
    },
    [rejectOne, rejectTarget],
  );

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-primary">{state.error}</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className="space-y-4">
      {actionError ? (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
          {actionError}
        </div>
      ) : null}
      <AdminQueueBatchToolbar
        batchBusy={batchBusy}
        rowBusy={busyId !== null}
        selectedCount={selected.size}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onBatchApprove={handleBatchApproveClick}
      />
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
                onToggle={toggle}
                onApproveRow={handleApproveRow}
                onRejectRow={openReject}
                busyId={busyId}
              />
            ))}
          </tbody>
        </table>
      </div>
      <AdminRejectModal
        open={rejectTarget !== null}
        challengeTitle={rejectTarget?.title ?? ''}
        onClose={handleModalClose}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
