'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  /** Label for the empty value ('' = no filter), always shown first. */
  allLabel: string;
  ariaLabel: string;
  className?: string;
};

/**
 * Themed replacement for a native `<select>` used as a list filter — the OS popup can't be
 * styled and clashes with the app. Button trigger + card-styled listbox, closes on outside
 * click / Escape.
 */
export function FilterSelect({ value, onChange, options, allLabel, ariaLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const items = [{ value: '', label: allLabel }, ...options];
  const current = items.find((o) => o.value === value) ?? items[0];

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={`truncate ${value ? 'font-semibold' : 'text-muted-foreground'}`}>
          {current.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-20 mt-1 max-h-64 w-full min-w-[11rem] overflow-auto rounded-md border border-border bg-card p-1 shadow-lg"
        >
          {items.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm ${
                  o.value === value
                    ? 'bg-primary/10 font-bold text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.value === value ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
