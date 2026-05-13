'use client';

import { useTranslations } from 'next-intl';

import type { AiTierFilter } from '@/features/admin/services/adminChallenges';

const TIER_FILTERS: AiTierFilter[] = ['all', 'green', 'orange', 'red', 'none'];

type Props = {
  tierFilter: AiTierFilter;
  onTierFilterChange: (value: AiTierFilter) => void;
  riskFirst: boolean;
  onRiskFirstChange: (value: boolean) => void;
  batchGreenOnly: boolean;
  onBatchGreenOnlyChange: (value: boolean) => void;
  disabled: boolean;
};

export function AdminQueueFilters({
  tierFilter,
  onTierFilterChange,
  riskFirst,
  onRiskFirstChange,
  batchGreenOnly,
  onBatchGreenOnlyChange,
  disabled,
}: Props) {
  const t = useTranslations('admin.queue');

  const tierLabel = (key: AiTierFilter): string => {
    switch (key) {
      case 'all':
        return t('filterTierAll');
      case 'green':
        return t('filterTierGreen');
      case 'orange':
        return t('filterTierOrange');
      case 'red':
        return t('filterTierRed');
      case 'none':
        return t('filterTierNone');
      default:
        return t('filterTierAll');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2">
      <label className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        <span>{t('filterTierLabel')}</span>
        <select
          value={tierFilter}
          disabled={disabled}
          onChange={(e) => {
            onTierFilterChange(e.target.value as AiTierFilter);
          }}
          className="rounded-sm border border-border bg-background px-2 py-1 text-xs font-semibold normal-case tracking-normal text-foreground"
          aria-label={t('filterTierLabel')}
        >
          {TIER_FILTERS.map((key) => (
            <option key={key} value={key}>
              {tierLabel(key)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        <input
          type="checkbox"
          checked={riskFirst}
          disabled={disabled}
          onChange={(e) => {
            onRiskFirstChange(e.target.checked);
          }}
          className="h-4 w-4 accent-primary"
        />
        {t('sortRiskFirst')}
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
        <input
          type="checkbox"
          checked={batchGreenOnly}
          disabled={disabled}
          onChange={(e) => {
            onBatchGreenOnlyChange(e.target.checked);
          }}
          className="h-4 w-4 accent-primary"
        />
        {t('batchGreenOnly')}
      </label>
    </div>
  );
}
