'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  canvasToPngBlob,
  downloadBlob,
  sharePngBlob,
} from '@/features/finisher-card/lib/canvasPng';

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  disabled?: boolean;
};

export function FinisherCardActions({ canvasRef, disabled }: Props) {
  const t = useTranslations('finisher');
  const [working, setWorking] = useState(false);

  const canUse = !disabled && !working;

  const getBlob = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return await canvasToPngBlob(canvas);
  }, [canvasRef]);

  const onDownload = useCallback(async () => {
    if (!canUse) return;
    setWorking(true);
    try {
      const blob = await getBlob();
      if (!blob) return;
      downloadBlob(blob, 'truegrynd-finisher.png');
    } finally {
      setWorking(false);
    }
  }, [canUse, getBlob]);

  const onShare = useCallback(async () => {
    if (!canUse) return;
    setWorking(true);
    try {
      const blob = await getBlob();
      if (!blob) return;
      await sharePngBlob(blob, 'truegrynd-finisher.png');
    } finally {
      setWorking(false);
    }
  }, [canUse, getBlob]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => void onDownload()}
        disabled={!canUse}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {t('download')}
      </button>
      <button
        type="button"
        onClick={() => void onShare()}
        disabled={!canUse}
        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted disabled:opacity-50"
      >
        {t('share')}
      </button>
    </div>
  );
}
