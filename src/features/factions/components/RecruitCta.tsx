'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  buildReferralShareCopy,
  buildReferralUrl,
  type ReferralParams,
} from '@/features/factions/lib/referral';
import { getFactionBadgeClasses } from '@/lib/factionStyles';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';
import type { Division, Faction } from '@/lib/types/database.types';

type Props = {
  faction: Faction;
  siteUrl: string;
  division?: Division | null;
  weeklyLabel?: string | null;
};

export function RecruitCta({ faction, siteUrl, division = null, weeklyLabel = null }: Props) {
  const t = useTranslations('clan.recruit');
  const tFaction = useTranslations('clan.faction');
  const [copied, setCopied] = useState(false);

  const referralParams = useMemo((): ReferralParams => {
    const params: ReferralParams = { faction };
    if (division) params.division = division;
    if (weeklyLabel) params.weekly = weeklyLabel;
    return params;
  }, [division, faction, weeklyLabel]);

  const referralUrl = buildReferralUrl(siteUrl, referralParams);
  const shareCopy = buildReferralShareCopy(referralParams);
  const factionName = tFaction(faction);
  const shareParams = useMemo(
    () => ({
      faction: factionName,
      division: division?.toUpperCase() ?? '',
      weekly: weeklyLabel ?? '',
    }),
    [division, factionName, weeklyLabel],
  );
  const factionStyles = getFactionBadgeClasses(faction);

  const shareTitle =
    shareCopy.titleKey === 'contextual'
      ? t('shareTitleContextual', shareParams)
      : t('shareTitle', { faction: factionName });
  const shareText =
    shareCopy.textKey === 'contextual'
      ? t('shareTextContextual', shareParams)
      : t('shareText', { faction: factionName });

  const trackShare = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.shareReferral, {
      faction,
      division: division ?? '',
      weekly: weeklyLabel ?? '',
    });
  }, [division, faction, weeklyLabel]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare();
    } catch {
      /* clipboard not available */
    }
  }, [referralUrl, trackShare]);

  const handleShare = useCallback(async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: referralUrl });
        trackShare();
      } catch {
        /* user cancelled or not supported */
      }
    } else {
      await handleCopy();
    }
  }, [handleCopy, referralUrl, shareText, shareTitle, trackShare]);

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
          aria-label={t('shareAria', { faction: factionName })}
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
