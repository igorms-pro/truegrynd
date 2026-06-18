'use client';

import { ProofLevelBadge } from '@/components/ProofLevelBadge';
import { ReportScoreButton } from '@/features/challenges/components/ReportScoreButton';
import { RespectButton } from '@/features/challenges/components/RespectButton';
import { formatScore } from '@/features/challenges/lib/scoreFormat';
import type { LeaderboardEntry } from '@/features/challenges/lib/types';
import { rankMedalColorClass } from '@/lib/rankMedal';
import type { ScoreType } from '@/lib/types/database.types';

type Props = {
  rank: number;
  entry: LeaderboardEntry;
  scoreType: ScoreType;
  currentUserId: string | null;
  respectCount: number;
  isRespected: boolean;
  respectDisabled: boolean;
  onRespectToggle: (scoreId: string) => Promise<void>;
  showDivisionBadge: boolean;
  isCurrentUser: boolean;
  youLabel: string;
};

/** One ranked row: medal-coloured rank, username (+ YOU tag), proof badge, score, respect, report. */
export function LeaderboardRow({
  rank,
  entry,
  scoreType,
  currentUserId,
  respectCount,
  isRespected,
  respectDisabled,
  onRespectToggle,
  showDivisionBadge,
  isCurrentUser,
  youLabel,
}: Props) {
  const username = entry.profile?.username ?? '—';
  return (
    <li
      className={[
        'border-b border-border px-3 py-2 last:border-b-0',
        isCurrentUser ? 'bg-accent/10 ring-1 ring-inset ring-accent/40' : '',
      ].join(' ')}
    >
      <div className="grid grid-cols-[3rem_1fr_auto_auto] items-center gap-3">
        <span className={`font-mono text-sm font-black tabular-nums ${rankMedalColorClass(rank)}`}>
          #{rank}
        </span>
        <div className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-foreground">{username}</span>
            {isCurrentUser ? (
              <span className="shrink-0 rounded-sm bg-accent px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-accent-foreground">
                {youLabel}
              </span>
            ) : null}
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <ProofLevelBadge level={entry.proof_level} compact />
            {showDivisionBadge && entry.profile?.division ? (
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                {entry.profile.division}
              </span>
            ) : null}
          </div>
        </div>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {formatScore(entry.value, scoreType)}
        </span>
        <RespectButton
          scoreId={entry.id}
          scoreUserId={entry.user_id}
          currentUserId={currentUserId}
          count={respectCount}
          respected={isRespected}
          disabled={respectDisabled}
          onToggle={onRespectToggle}
        />
      </div>
      <ReportScoreButton
        scoreId={entry.id}
        scoreUserId={entry.user_id}
        currentUserId={currentUserId}
      />
    </li>
  );
}
