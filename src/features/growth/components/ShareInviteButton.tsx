'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  url: string;
  shareTitle: string;
  shareText: string;
  shareAria: string;
  copyAria: string;
  analyticsEvent?: string;
  analyticsProps?: Record<string, string>;
  onShare?: () => void;
  onCopy?: () => void;
};

export function ShareInviteButton({
  url,
  shareTitle,
  shareText,
  shareAria,
  copyAria,
  analyticsEvent,
  analyticsProps,
  onShare,
  onCopy,
}: Props) {
  const t = useTranslations('growth.share');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch {
      /* clipboard unavailable */
    }
  }, [onCopy, url]);

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        onShare?.();
      } catch {
        /* cancelled */
      }
    } else {
      await handleCopy();
    }
  }, [handleCopy, onShare, shareText, shareTitle, url]);

  const shareDataAttrs = useMemo(() => {
    if (!analyticsEvent) return {};
    return {
      'data-analytics-event': analyticsEvent,
      'data-analytics-props': JSON.stringify(analyticsProps ?? {}),
    };
  }, [analyticsEvent, analyticsProps]);

  return (
    <div className="flex flex-wrap gap-2" {...shareDataAttrs}>
      <button
        type="button"
        onClick={() => void handleShare()}
        aria-label={shareAria}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('share')}
      </button>
      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label={copyAria}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? t('copied') : t('copy')}
      </button>
    </div>
  );
}
