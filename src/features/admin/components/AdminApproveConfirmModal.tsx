'use client';

import { useCallback, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  open: boolean;
  variant: 'single' | 'batch';
  challengeTitle?: string;
  batchCount?: number;
  batchGreenOnly?: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function AdminApproveConfirmModal({
  open,
  variant,
  challengeTitle,
  batchCount,
  batchGreenOnly,
  busy,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations('admin.approveConfirm');

  const handleBackdropClick = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  const handlePanelClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const handleConfirm = useCallback(() => {
    void onConfirm();
  }, [onConfirm]);

  if (!open) return null;

  const title = variant === 'single' ? t('titleSingle') : t('titleBatch');
  const body =
    variant === 'single'
      ? t('bodySingle', { title: challengeTitle ?? '' })
      : t('bodyBatch', { count: batchCount ?? 0 });
  const bodyGreenOnly = variant === 'batch' && batchGreenOnly ? t('bodyBatchGreenOnly') : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-approve-confirm-title"
        className="w-full max-w-md rounded-md border border-border bg-card p-4 shadow-lg"
        onClick={handlePanelClick}
      >
        <h2
          id="admin-approve-confirm-title"
          className="text-sm font-black uppercase tracking-[0.18em]"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{body}</p>
        {bodyGreenOnly ? <p className="mt-2 text-xs text-accent">{bodyGreenOnly}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleBackdropClick}
            disabled={busy}
            className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {busy ? t('submitting') : t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
