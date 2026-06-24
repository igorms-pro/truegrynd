'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

import { listGymLeads } from '@/features/growth/services/gymRequest';
import { useAsyncResource } from '@/hooks/useAsyncResource';

export function AdminGymLeads() {
  const locale = useLocale();
  const { state } = useAsyncResource(listGymLeads, []);

  return (
    <div className="space-y-4">
      <nav className="flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.18em]">
        <Link
          href={`/${locale}/app/admin/challenges`}
          className="text-muted-foreground hover:text-foreground"
        >
          UGC
        </Link>
        <Link
          href={`/${locale}/app/admin/weekly`}
          className="text-muted-foreground hover:text-foreground"
        >
          Weekly
        </Link>
        <Link
          href={`/${locale}/app/admin/events`}
          className="text-muted-foreground hover:text-foreground"
        >
          Events
        </Link>
        <Link
          href={`/${locale}/app/admin/proof`}
          className="text-muted-foreground hover:text-foreground"
        >
          Proof
        </Link>
        <span className="text-primary">Gym leads</span>
      </nav>

      <p className="text-sm text-muted-foreground">
        Gyms athletes asked to bring onto TrueGrynd, ranked by demand.
      </p>

      {state.status === 'loading' || state.status === 'idle' ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : state.status === 'error' ? (
        <p className="text-sm font-semibold text-primary">Could not load leads.</p>
      ) : state.data.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No gym requests yet.
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          {state.data.map((lead) => (
            <li
              key={lead.normalized}
              className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0"
            >
              <span className="flex h-8 w-10 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-black text-primary-foreground tabular-nums">
                {lead.requestCount}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{lead.gymName}</span>
                <span className="block text-xs text-muted-foreground">{lead.city ?? '—'}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {new Date(lead.lastRequested).toLocaleDateString(locale)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
