'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { AdminChallengeQueueBanner } from '@/features/admin/components/AdminChallengeQueueBanner';
import {
  AdminChallengeQueueEmpty,
  AdminChallengeQueueFetchError,
  AdminChallengeQueueLoading,
} from '@/features/admin/components/AdminChallengeQueueStates';
import { AdminChallengeQueueDialogs } from '@/features/admin/components/AdminChallengeQueueDialogs';
import { AdminPendingChallengesTable } from '@/features/admin/components/AdminPendingChallengesTable';
import { AdminQueueBatchToolbar } from '@/features/admin/components/AdminQueueBatchToolbar';
import { AdminQueueFilters } from '@/features/admin/components/AdminQueueFilters';
import { AdminQueuePagination } from '@/features/admin/components/AdminQueuePagination';
import { useAdminChallengeQueueUi } from '@/features/admin/hooks/useAdminChallengeQueueUi';
import { useAdminPendingChallenges } from '@/features/admin/hooks/useAdminPendingChallenges';
import { useAdminQueueSubmittedLabels } from '@/features/admin/hooks/useAdminQueueSubmittedLabels';
import { adminQueueMaxPage } from '@/features/admin/lib/adminQueueConstants';
import { formatAdminAnalyzeError } from '@/features/admin/lib/formatAdminAnalyzeError';
import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';
import { useAuth } from '@/features/auth/AuthProvider';

export function AdminChallengeQueue() {
  const tErr = useTranslations('admin.errors');
  const locale = useLocale();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;

  const {
    state,
    page,
    setPage,
    pageSize,
    tierFilter,
    setTierFilter,
    riskFirst,
    setRiskFirst,
    refetch,
    approveOne,
    batchApprove,
    rejectOne,
    analyzeOne,
    analyzeBusyId,
  } = useAdminPendingChallenges();

  const [batchGreenOnly, setBatchGreenOnly] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const rows = useMemo((): PendingRow[] => {
    return state.status === 'ready' ? state.rows : [];
  }, [state]);

  const totalCount = state.status === 'ready' ? state.totalCount : 0;
  const totalPages = adminQueueMaxPage(totalCount, pageSize);

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const rowsWithLabels = useAdminQueueSubmittedLabels(rows, locale);

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
    batchGreenOnly,
  });

  const handleAnalyzeRow = useCallback(
    async (id: string) => {
      setAnalyzeError(null);
      try {
        await analyzeOne(id);
      } catch (e: unknown) {
        const code = e instanceof Error ? e.message : 'unknown';
        setAnalyzeError(formatAdminAnalyzeError(code, tErr));
      }
    },
    [analyzeOne, tErr],
  );

  const goPrevPage = useCallback(() => {
    setPage(Math.max(1, page - 1));
  }, [page, setPage]);

  const goNextPage = useCallback(() => {
    setPage(Math.min(totalPages, page + 1));
  }, [page, setPage, totalPages]);

  const interactionLocked = busyId !== null || batchBusy || approveBusy || analyzeBusyId !== null;

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
    return <AdminChallengeQueueLoading />;
  }

  if (state.status === 'error') {
    return <AdminChallengeQueueFetchError message={state.error} onRetry={refetch} />;
  }

  if (state.status === 'ready' && state.totalCount === 0) {
    return <AdminChallengeQueueEmpty />;
  }

  return (
    <div className="space-y-4">
      <AdminChallengeQueueBanner message={actionError ?? analyzeError} />
      <AdminQueueFilters
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        riskFirst={riskFirst}
        onRiskFirstChange={setRiskFirst}
        batchGreenOnly={batchGreenOnly}
        onBatchGreenOnlyChange={setBatchGreenOnly}
        disabled={interactionLocked}
      />
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
        analyzeBusyId={analyzeBusyId}
        analyzeDisabled={!accessToken}
        onToggle={toggle}
        onApproveRow={requestApproveRow}
        onRejectRow={openReject}
        onAnalyzeRow={handleAnalyzeRow}
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
        approveModalOpen={approveTarget !== null}
        approveVariant={approveTarget?.kind === 'batch' ? 'batch' : 'single'}
        approveChallengeTitle={approveTarget?.kind === 'single' ? approveTarget.row.title : ''}
        approveBatchCount={approveTarget?.kind === 'batch' ? approveTarget.ids.length : 0}
        approveBatchGreenOnly={approveTarget?.kind === 'batch' ? batchGreenOnly : false}
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
