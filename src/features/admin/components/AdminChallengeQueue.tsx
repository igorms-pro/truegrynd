'use client';

import { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminChallengeQueueDialogs } from '@/features/admin/components/AdminChallengeQueueDialogs';
import { AdminPendingChallengesTable } from '@/features/admin/components/AdminPendingChallengesTable';
import { AdminQueueBatchToolbar } from '@/features/admin/components/AdminQueueBatchToolbar';
import { AdminQueuePagination } from '@/features/admin/components/AdminQueuePagination';
import { useAdminChallengeQueueUi } from '@/features/admin/hooks/useAdminChallengeQueueUi';
import { useAdminPendingChallenges } from '@/features/admin/hooks/useAdminPendingChallenges';
import { adminQueueMaxPage } from '@/features/admin/lib/adminQueueConstants';
import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';

export function AdminChallengeQueue() {
  const t = useTranslations('admin.queue');
  const tErr = useTranslations('admin.errors');
  const locale = useLocale();
  const { state, page, setPage, pageSize, approveOne, batchApprove, rejectOne } =
    useAdminPendingChallenges();

  const rows = useMemo((): PendingRow[] => {
    return state.status === 'ready' ? state.rows : [];
  }, [state]);

  const totalCount = state.status === 'ready' ? state.totalCount : 0;
  const totalPages = adminQueueMaxPage(totalCount, pageSize);

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

  const formatActionError = useCallback(
    (message: string) => `${tErr('actionFailed')} (${message})`,
    [tErr],
  );

  const {
    selected,
    toggle,
    selectAll,
    clearSelection,
    busyId,
    batchBusy,
    approveBusy,
    actionError,
    rejectTarget,
    approveTarget,
    setApproveTarget,
    requestApproveRow,
    handleConfirmApprove,
    handleBatchApproveRequest,
    handleModalClose,
    handleConfirmReject,
    openReject,
  } = useAdminChallengeQueueUi({
    rows,
    approveOne,
    batchApprove,
    rejectOne,
    formatActionError,
  });

  const goPrevPage = useCallback(() => {
    setPage(Math.max(1, page - 1));
  }, [page, setPage]);

  const goNextPage = useCallback(() => {
    setPage(Math.min(totalPages, page + 1));
  }, [page, setPage, totalPages]);

  const interactionLocked = busyId !== null || batchBusy || approveBusy;

  const handleBatchClick = useCallback(() => {
    handleBatchApproveRequest([...selected]);
  }, [handleBatchApproveRequest, selected]);

  const handleSelectAll = useCallback(() => {
    selectAll(allIds);
  }, [allIds, selectAll]);

  const closeApproveModal = useCallback(() => {
    setApproveTarget(null);
  }, [setApproveTarget]);

  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }

  if (state.status === 'error') {
    return <p className="text-sm text-primary">{state.error}</p>;
  }

  if (state.status === 'ready' && state.totalCount === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  const approveModalOpen = approveTarget !== null;
  const approveVariant = approveTarget?.kind === 'batch' ? 'batch' : 'single';
  const batchCount = approveTarget?.kind === 'batch' ? approveTarget.ids.length : 0;
  const singleTitle = approveTarget?.kind === 'single' ? approveTarget.row.title : '';

  return (
    <div className="space-y-4">
      {actionError ? (
        <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
          {actionError}
        </div>
      ) : null}
      <AdminQueueBatchToolbar
        batchBusy={batchBusy}
        rowBusy={interactionLocked}
        selectedCount={selected.size}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
        onRequestBatchApprove={handleBatchClick}
      />
      <AdminPendingChallengesTable
        rowsWithLabels={rowsWithLabels}
        selected={selected}
        busyId={busyId}
        onToggle={toggle}
        onApproveRow={requestApproveRow}
        onRejectRow={openReject}
      />
      <AdminQueuePagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        disabled={interactionLocked}
        onPrev={goPrevPage}
        onNext={goNextPage}
      />
      <AdminChallengeQueueDialogs
        approveModalOpen={approveModalOpen}
        approveVariant={approveVariant}
        approveChallengeTitle={singleTitle}
        approveBatchCount={batchCount}
        approveBusy={approveBusy}
        onApproveClose={closeApproveModal}
        onApproveConfirm={handleConfirmApprove}
        rejectOpen={rejectTarget !== null}
        rejectChallengeTitle={rejectTarget?.title ?? ''}
        onRejectClose={handleModalClose}
        onRejectConfirm={handleConfirmReject}
      />
    </div>
  );
}
