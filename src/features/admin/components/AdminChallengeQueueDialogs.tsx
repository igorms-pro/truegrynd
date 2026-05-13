'use client';

import { AdminApproveConfirmModal } from '@/features/admin/components/AdminApproveConfirmModal';
import { AdminRejectModal } from '@/features/admin/components/AdminRejectModal';

type Props = {
  approveModalOpen: boolean;
  approveVariant: 'single' | 'batch';
  approveChallengeTitle: string;
  approveBatchCount: number;
  approveBusy: boolean;
  onApproveClose: () => void;
  onApproveConfirm: () => void | Promise<void>;
  rejectOpen: boolean;
  rejectChallengeTitle: string;
  onRejectClose: () => void;
  onRejectConfirm: (reason: string) => Promise<void>;
};

export function AdminChallengeQueueDialogs({
  approveModalOpen,
  approveVariant,
  approveChallengeTitle,
  approveBatchCount,
  approveBusy,
  onApproveClose,
  onApproveConfirm,
  rejectOpen,
  rejectChallengeTitle,
  onRejectClose,
  onRejectConfirm,
}: Props) {
  return (
    <>
      <AdminApproveConfirmModal
        open={approveModalOpen}
        variant={approveVariant}
        challengeTitle={approveChallengeTitle}
        batchCount={approveBatchCount}
        busy={approveBusy}
        onClose={onApproveClose}
        onConfirm={onApproveConfirm}
      />
      <AdminRejectModal
        open={rejectOpen}
        challengeTitle={rejectChallengeTitle}
        onClose={onRejectClose}
        onConfirm={onRejectConfirm}
      />
    </>
  );
}
