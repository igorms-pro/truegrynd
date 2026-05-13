'use client';

import { useCallback, useState } from 'react';

import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';

type ApproveTarget = null | { kind: 'single'; row: PendingRow } | { kind: 'batch'; ids: string[] };

type Params = {
  rows: PendingRow[];
  approveOne: (id: string) => Promise<void>;
  batchApprove: (ids: string[]) => Promise<number>;
  rejectOne: (id: string, reason: string) => Promise<void>;
  formatActionError: (message: string) => string;
};

export function useAdminChallengeQueueUi({
  rows,
  approveOne,
  batchApprove,
  rejectOne,
  formatActionError,
}: Params): {
  selected: Set<string>;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  busyId: string | null;
  batchBusy: boolean;
  approveBusy: boolean;
  actionError: string | null;
  rejectTarget: PendingRow | null;
  approveTarget: ApproveTarget;
  setApproveTarget: (v: ApproveTarget) => void;
  requestApproveRow: (id: string) => void;
  handleConfirmApprove: () => Promise<void>;
  handleBatchApproveRequest: (selectedIds: string[]) => void;
  handleModalClose: () => void;
  handleConfirmReject: (reason: string) => Promise<void>;
  openReject: (id: string) => void;
} {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [approveBusy, setApproveBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingRow | null>(null);
  const [approveTarget, setApproveTarget] = useState<ApproveTarget>(null);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const runApproveSingle = useCallback(
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
        setActionError(formatActionError(message));
      } finally {
        setBusyId(null);
      }
    },
    [approveOne, formatActionError],
  );

  const requestApproveRow = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id);
      if (!row) return;
      setApproveTarget({ kind: 'single', row });
    },
    [rows],
  );

  const handleConfirmApprove = useCallback(async () => {
    if (!approveTarget) return;
    setApproveBusy(true);
    if (approveTarget.kind === 'batch') {
      setBatchBusy(true);
    }
    setActionError(null);
    try {
      if (approveTarget.kind === 'single') {
        await runApproveSingle(approveTarget.row.id);
      } else {
        await batchApprove(approveTarget.ids);
        clearSelection();
      }
      setApproveTarget(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setActionError(formatActionError(message));
    } finally {
      setBatchBusy(false);
      setApproveBusy(false);
    }
  }, [approveTarget, batchApprove, clearSelection, formatActionError, runApproveSingle]);

  const handleBatchApproveRequest = useCallback((selectedIds: string[]) => {
    if (selectedIds.length === 0) return;
    setApproveTarget({ kind: 'batch', ids: selectedIds });
  }, []);

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

  const openReject = useCallback(
    (id: string) => {
      const row = rows.find((r) => r.id === id) ?? null;
      setRejectTarget(row);
    },
    [rows],
  );

  return {
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
  };
}
