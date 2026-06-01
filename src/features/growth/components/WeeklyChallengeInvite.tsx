'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { ShareInviteButton } from '@/features/growth/components/ShareInviteButton';
import { type ReferralParams } from '@/features/factions/lib/referral';
import { buildWeeklyInviteUrl } from '@/lib/growth/inviteLinks';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';
import type { Division, Faction } from '@/lib/types/database.types';

type Props = {
  challengeId: string;
  faction: Faction;
  division: Division;
  weeklyLabel: string;
};

export function WeeklyChallengeInvite({ challengeId, faction, division, weeklyLabel }: Props) {
  const t = useTranslations('growth.weeklyInvite');
  const locale = useLocale();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truegrynd.app';

  const inviteUrl = useMemo(() => {
    const params: ReferralParams = { faction, division, weekly: weeklyLabel };
    return buildWeeklyInviteUrl(siteUrl, locale, challengeId, params);
  }, [challengeId, division, faction, locale, siteUrl, weeklyLabel]);

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('title')}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t('body')}</p>
      <div className="mt-3">
        <ShareInviteButton
          url={inviteUrl}
          shareTitle={t('shareTitle', {
            faction,
            division: division.toUpperCase(),
            weekly: weeklyLabel,
          })}
          shareText={t('shareText', {
            faction,
            division: division.toUpperCase(),
            weekly: weeklyLabel,
          })}
          shareAria={t('shareAria')}
          copyAria={t('copyAria')}
          onShare={() =>
            trackEvent(ANALYTICS_EVENTS.shareWeeklyInvite, {
              challengeId,
              faction,
              division,
            })
          }
          onCopy={() =>
            trackEvent(ANALYTICS_EVENTS.shareWeeklyInvite, {
              challengeId,
              faction,
              division,
            })
          }
        />
      </div>
    </div>
  );
}
