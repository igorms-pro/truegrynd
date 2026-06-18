'use client';

import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useFactionRecentVideos } from '@/features/factions/hooks/useFactionRecentVideos';
import { formatScore } from '@/features/challenges/lib/scoreFormat';
import type { Faction } from '@/lib/types/database.types';

export function FactionRecentProof({ faction }: { faction: Faction }) {
  const t = useTranslations('factionPage');
  const state = useFactionRecentVideos(faction);

  return (
    <article className="rounded-md border border-border bg-card p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {t('recentProofTitle')}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t('recentProofSubtitle')}</p>

      {state.status === 'ready' && state.rows.length > 0 ? (
        <ul className="mt-3 divide-y divide-border">
          {state.rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 py-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-border bg-background text-accent">
                <Play className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{row.username}</p>
                <p className="truncate text-xs text-muted-foreground">{row.challengeTitle}</p>
              </div>
              <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                {formatScore(row.value, row.scoreType)}
              </span>
              <a
                href={row.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('recentProofView')}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      {state.status === 'ready' && state.rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('recentProofEmpty')}</p>
      ) : null}

      {state.status === 'error' ? (
        <p className="mt-3 text-sm text-muted-foreground">{t('recentProofEmpty')}</p>
      ) : null}
    </article>
  );
}
