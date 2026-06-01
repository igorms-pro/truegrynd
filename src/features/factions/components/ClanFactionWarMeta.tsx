'use client';

import { useTranslations } from 'next-intl';

import type { FactionWarContext } from '@/features/factions/services/factionWar';
import { formatClanPoints } from '@/features/factions/lib/formatClanPoints';

type Props = {
  war: FactionWarContext | null;
  myContribution: number;
};

export function ClanFactionWarMeta({ war, myContribution }: Props) {
  const t = useTranslations('clan');
  const tDivision = useTranslations('divisions');

  if (war) {
    const weekLabel = war.weekLabel?.trim();
    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs text-muted-foreground">
          {weekLabel ? t('warWeeklyActive', { label: weekLabel }) : t('warWeeklyActiveDefault')}
          {' · '}
          {t('warDivisionScope', { division: tDivision(war.division) })}
        </p>
        {myContribution > 0 ? (
          <p className="text-xs font-black uppercase tracking-[0.14em] text-accent">
            {t('warYourContribution', { points: formatClanPoints(myContribution) })}
          </p>
        ) : null}
      </div>
    );
  }

  return <p className="mt-2 text-xs text-muted-foreground">{t('warNoWeekly')}</p>;
}
