'use client';

import { useTranslations } from 'next-intl';

import { ClanArenaCta } from '@/features/factions/components/ClanArenaCta';
import { ClanFactionWarCard } from '@/features/factions/components/ClanFactionWarCard';
import { ClanTopMembersCard } from '@/features/factions/components/ClanTopMembersCard';
import { RecruitCta } from '@/features/factions/components/RecruitCta';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { useClanHud } from '@/features/factions/hooks/useClanHud';

export function ClanScreen() {
  const tabs = useTranslations('app.tabs');
  const t = useTranslations('clan');

  const { state, refetch } = useClanHud();
  const appProfile = useOptionalAppProfile();
  const currentUserId = appProfile?.id ?? null;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{tabs('clan')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      {state.status === 'loading' ? (
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {t('loading')}
        </p>
      ) : null}

      {state.status === 'error' ? (
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {t('errorTitle')}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{t('errorBody')}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t('retry')}
          </button>
        </div>
      ) : null}

      {state.status === 'ready' && state.faction ? (
        <RecruitCta
          faction={state.faction}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? 'https://truegrynd.app'}
        />
      ) : null}

      {state.status === 'ready' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <ClanFactionWarCard
              rankings={state.rankings}
              userFaction={state.faction}
              war={state.war}
              myContribution={state.myContribution}
            />
            <ClanTopMembersCard
              members={state.members}
              userFaction={state.faction}
              currentUserId={currentUserId}
            />
          </div>
          <ClanArenaCta />
        </>
      ) : null}
    </section>
  );
}
