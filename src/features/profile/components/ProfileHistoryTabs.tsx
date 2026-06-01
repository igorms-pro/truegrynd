'use client';

import { useTranslations } from 'next-intl';

import { HISTORY_TABS, type HistoryTab } from '@/features/profile/types';

type Props = {
  active: HistoryTab;
  onChange: (tab: HistoryTab) => void;
  disabled: boolean;
};

export function ProfileHistoryTabs({ active, onChange, disabled }: Props) {
  const t = useTranslations('profile.historyPage.tabs');

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('listAria')}>
      {HISTORY_TABS.map((tab) => {
        const isActive = active === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={t(`aria.${tab}`)}
            disabled={disabled}
            onClick={() => onChange(tab)}
            className={[
              'shrink-0 rounded-sm border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors',
              isActive
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t(tab)}
          </button>
        );
      })}
    </div>
  );
}
