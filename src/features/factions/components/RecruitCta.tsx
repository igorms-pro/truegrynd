'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { buildReferralUrl } from '@/features/factions/lib/referral';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import type { Faction } from '@/lib/types/database.types';

type Props = {
  faction: Faction;
  siteUrl: string;
};

export function RecruitCta({ faction, siteUrl }: Props) {
  const t = useTranslations('clan.recruit');
  const tFaction = useTranslations('clan.faction');
  const [copied, setCopied] = useState(false);

  const referralUrl = buildReferralUrl(siteUrl, faction);
  const factionName = tFaction(faction);
  const factionParams = useMemo(() => ({ faction: factionName }), [factionName]);
  const factionStyles = getFactionBadgeClasses(faction);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  }, [referralUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t('shareTitle', factionParams),
          text: t('shareText', factionParams),
          url: referralUrl,
        });
      } catch {
        /* user cancelled or not supported */
      }
    } else {
      await handleCopy();
    }
  }, [factionParams, handleCopy, referralUrl, t]);

  return (
    <article
      className={`rounded-md border border-l-4 bg-card p-4 ${factionStyles.accent} ${factionStyles.border}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('title')}
      </p>
      <p
        className="mt-3 break-all rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground"
        title={referralUrl}
      >
        {referralUrl}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleShare()}
          aria-label={t('shareAria', factionParams)}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('share')}
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label={t('copyAria')}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
    </article>
  );
}
