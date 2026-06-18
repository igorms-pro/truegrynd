'use client';

import { useId, useState, type ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Accessible segmented tabs. Keeps a long profile/passport on one screen by
 * swapping panels in place instead of stacking every section vertically.
 */
export function Tabs({ tabs, ariaLabel }: { tabs: TabItem[]; ariaLabel?: string }) {
  const baseId = useId();
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto rounded-md border border-border bg-card p-1"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={[
                'min-h-11 flex-1 whitespace-nowrap rounded-sm px-3 py-2 text-xs font-black uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) =>
        tab.id === active ? (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            className="space-y-6"
          >
            {tab.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
