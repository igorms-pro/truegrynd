'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { AdminPendingChallenge as PendingRow } from '@/features/admin/services/adminChallenges';
import type { ChallengeAiTier } from '@/lib/types/database.types';

function creatorLabel(row: PendingRow): string {
  return row.creator?.username?.trim() || '—';
}

function tierBadgeClass(tier: ChallengeAiTier | null | undefined): string {
  if (tier === 'green') return 'border-emerald-500/50 text-emerald-400';
  if (tier === 'orange') return 'border-accent/50 text-accent';
  if (tier === 'red') return 'border-primary/60 text-primary';
  return 'border-border text-muted-foreground';
}

function summaryPreview(text: string | null | undefined, maxLen: number): string {
  const s = text?.trim() ?? '';
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen)}…`;
}

type TierHelpFn = (key: string) => string;

function tierHelpLabel(t: TierHelpFn, tier: ChallengeAiTier | null): string {
  if (!tier) return t('tierLongUnknown');
  switch (tier) {
    case 'green':
      return t('tierLongGreen');
    case 'orange':
      return t('tierLongOrange');
    case 'red':
      return t('tierLongRed');
    default:
      return t('tierLongUnknown');
  }
}

type Props = {
  row: PendingRow;
  submittedLabel: string;
  checked: boolean;
  onToggle: (id: string) => void;
  onApproveRow: (id: string) => void | Promise<void>;
  onRejectRow: (id: string) => void;
  onAnalyzeRow: (id: string) => void;
  busyId: string | null;
  analyzeBusyId: string | null;
  analyzeDisabled: boolean;
};

export function AdminPendingChallengeRow({
  row,
  submittedLabel,
  checked,
  onToggle,
  onApproveRow,
  onRejectRow,
  onAnalyzeRow,
  busyId,
  analyzeBusyId,
  analyzeDisabled,
}: Props) {
  const t = useTranslations('admin.queue');
  const disabled = busyId !== null || analyzeBusyId !== null;
  const analyzing = analyzeBusyId === row.id;
  const onApprove = useCallback(() => {
    void onApproveRow(row.id);
  }, [onApproveRow, row.id]);
  const onReject = useCallback(() => {
    onRejectRow(row.id);
  }, [onRejectRow, row.id]);
  const onCheckboxChange = useCallback(() => {
    onToggle(row.id);
  }, [onToggle, row.id]);
  const onAnalyze = useCallback(() => {
    onAnalyzeRow(row.id);
  }, [onAnalyzeRow, row.id]);

  const tier = row.ai_tier ?? null;
  const badgeLetter = tier === 'green' ? 'G' : tier === 'orange' ? 'O' : tier === 'red' ? 'R' : '—';
  const tierHelp = tierHelpLabel(t, tier);
  const summary = summaryPreview(row.ai_summary, 96);
  const fullSummary = row.ai_summary?.trim() || undefined;

  return (
    <tr className="border-b border-border">
      <td className="py-3 pr-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheckboxChange}
          disabled={disabled}
          aria-label={t('selectRow', { title: row.title })}
          className="h-4 w-4 accent-primary"
        />
      </td>
      <td className="py-3 pr-2 text-sm font-semibold">{row.title}</td>
      <td className="py-3 pr-2 max-w-[14rem]">
        <div className="flex items-start gap-2">
          <span
            className={`inline-flex min-w-[1.5rem] justify-center rounded-sm border px-1 py-0.5 text-[10px] font-black tracking-wider ${tierBadgeClass(tier)}`}
            title={tierHelp}
          >
            {badgeLetter}
          </span>
          {summary ? (
            <span className="line-clamp-2 text-[11px] text-muted-foreground" title={fullSummary}>
              {summary}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">—</span>
          )}
        </div>
      </td>
      <td className="py-3 pr-2 text-xs uppercase text-muted-foreground">{row.score_type}</td>
      <td className="py-3 pr-2 text-xs text-muted-foreground">{creatorLabel(row)}</td>
      <td className="py-3 pr-2 text-xs text-muted-foreground">{submittedLabel}</td>
      <td className="py-3 text-right">
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled}
          className="mr-2 rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-wider hover:bg-muted disabled:opacity-50"
        >
          {t('approve')}
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className="mr-2 rounded-sm border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/20 disabled:opacity-50"
        >
          {t('reject')}
        </button>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={disabled || analyzeDisabled || analyzing}
          aria-label={t('analyzeAria', { title: row.title })}
          className="rounded-sm border border-border px-2 py-1 text-[10px] font-black uppercase tracking-wider hover:bg-muted disabled:opacity-50"
        >
          {analyzing ? t('analyzing') : t('analyze')}
        </button>
      </td>
    </tr>
  );
}
