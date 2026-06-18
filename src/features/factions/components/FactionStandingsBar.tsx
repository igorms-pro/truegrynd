import type { Faction } from '@/lib/types/database.types';

type StandingRow = { faction: Faction; points: number };

type Props = {
  rankings: readonly StandingRow[];
  myFaction: Faction;
  /** Display label for a faction (callers pass their own i18n namespace). */
  getLabel: (faction: Faction) => string;
  /** Show the raw points on the right of each bar. */
  showPoints?: boolean;
  formatPoints?: (points: number) => string;
};

/**
 * Horizontal "faction standings" bars (one per faction, width ∝ points, the
 * viewer's faction highlighted). Shared by the Overview faction card and the
 * faction page war stats so the visualization lives in one place.
 */
export function FactionStandingsBar({
  rankings,
  myFaction,
  getLabel,
  showPoints = false,
  formatPoints = (n) => n.toLocaleString(),
}: Props) {
  const sorted = [...rankings].sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(1, sorted[0]?.points ?? 0);

  return (
    <div className="space-y-2">
      {sorted.map((row) => {
        const mine = row.faction === myFaction;
        return (
          <div key={row.faction} className="flex items-center gap-2">
            <span
              className={[
                'w-28 shrink-0 truncate text-[10px] font-black uppercase tracking-[0.14em]',
                mine ? 'text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              {getLabel(row.faction)}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className={mine ? 'block h-full bg-accent' : 'block h-full bg-muted-foreground/40'}
                style={{ width: `${Math.round((row.points / maxPoints) * 100)}%` }}
              />
            </span>
            {showPoints ? (
              <span className="w-14 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                {formatPoints(row.points)}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
