'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import { submitReport } from '@/features/challenges/services/reports';

type Props = {
  scoreId: string;
  scoreUserId: string;
  currentUserId: string | null;
};

type Phase = 'idle' | 'open' | 'submitting' | 'done' | 'error';

export function ReportScoreButton({ scoreId, scoreUserId, currentUserId }: Props) {
  const t = useTranslations('proof.report');
  const [phase, setPhase] = useState<Phase>('idle');
  const [reason, setReason] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const canReport = currentUserId && currentUserId !== scoreUserId;

  const close = useCallback(() => {
    setPhase('idle');
    setReason('');
    setErrorKey(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (reason.trim().length < 5) {
      setErrorKey('reasonTooShort');
      return;
    }
    setPhase('submitting');
    setErrorKey(null);
    try {
      await submitReport({ targetType: 'score', targetId: scoreId, reason });
      setPhase('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setErrorKey(msg === 'already_reported' ? 'alreadyReported' : 'generic');
      setPhase('error');
    }
  }, [reason, scoreId]);

  if (!canReport) return null;

  if (phase === 'done') {
    return (
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        {t('thanks')}
      </p>
    );
  }

  if (phase === 'open' || phase === 'submitting' || phase === 'error') {
    return (
      <div className="mt-2 w-full rounded-sm border border-border bg-muted/40 p-2">
        <label htmlFor={`report-${scoreId}`} className="sr-only">
          {t('reasonLabel')}
        </label>
        <textarea
          id={`report-${scoreId}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder={t('reasonPlaceholder')}
          className="w-full resize-none rounded-sm border border-border bg-background px-2 py-1 text-xs text-foreground"
        />
        {errorKey ? (
          <p className="mt-1 text-[10px] text-primary" role="alert">
            {t(`errors.${errorKey}`)}
          </p>
        ) : null}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={phase === 'submitting'}
            onClick={() => void handleSubmit()}
            className="min-h-9 rounded-sm bg-primary px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-50"
          >
            {t('submit')}
          </button>
          <button
            type="button"
            onClick={close}
            className="min-h-9 rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPhase('open')}
      className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={t('aria')}
    >
      {t('cta')}
    </button>
  );
}
