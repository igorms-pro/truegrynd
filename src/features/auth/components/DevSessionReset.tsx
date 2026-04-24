'use client';

import { supabase } from '@/lib/supabase';

type Props = {
  onReset?: () => void;
};

export function DevSessionReset({ onReset }: Props) {
  return (
    <div className="w-full rounded-lg border border-border bg-card p-3 text-left">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground">DEV</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await supabase.auth.signOut();
          } finally {
            if (typeof window !== 'undefined') {
              for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
                const k = window.localStorage.key(i);
                if (k && k.startsWith('sb-')) window.localStorage.removeItem(k);
              }
              onReset?.();
              window.location.reload();
            }
          }
        }}
        className="mt-2 w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm font-semibold hover:opacity-90"
      >
        Reset session (sign out + clear storage)
      </button>
    </div>
  );
}
