'use client';

import { useCallback, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useTranslations } from 'next-intl';

const MIN_REASON_LEN = 10;
const MAX_REASON_LEN = 500;

type Props = {
  open: boolean;
  challengeTitle: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function AdminRejectModal({ open, challengeTitle, onClose, onConfirm }: Props) {
  const t = useTranslations('admin.rejectModal');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setReason('');
    setError(null);
    setBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    if (busy) return;
    reset();
    onClose();
  }, [busy, onClose, reset]);

  const handleReasonChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  }, []);

  const handleDialogPanelClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  const handleConfirm = useCallback(async () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LEN) {
      setError(t('reasonTooShort'));
      return;
    }
    if (trimmed.length > MAX_REASON_LEN) {
      setError(t('reasonTooLongMax', { max: MAX_REASON_LEN }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(trimmed);
      reset();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown';
      setError(`${t('failed')} (${message})`);
    } finally {
      setBusy(false);
    }
  }, [onClose, onConfirm, reason, reset, t]);

  const handleConfirmClick = useCallback(() => {
    void handleConfirm();
  }, [handleConfirm]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-reject-title"
        className="w-full max-w-md rounded-md border border-border bg-card p-4 shadow-lg"
        onClick={handleDialogPanelClick}
      >
        <h2 id="admin-reject-title" className="text-sm font-black uppercase tracking-[0.18em]">
          {t('title')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{challengeTitle}</p>
        <label
          htmlFor="admin-reject-reason"
          className="mt-4 block text-xs font-black uppercase tracking-[0.18em]"
        >
          {t('reasonLabel')}
        </label>
        <textarea
          id="admin-reject-reason"
          value={reason}
          onChange={handleReasonChange}
          rows={4}
          maxLength={MAX_REASON_LEN}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          disabled={busy}
        />
        {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="rounded-md border border-border px-3 py-2 text-xs font-black uppercase tracking-[0.18em] hover:bg-muted disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
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
