'use client';

import { AlertTriangle, Mail } from 'lucide-react';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { listAtRiskMembers, type AtRiskMember } from '@/features/pro/services/retention';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/trackEvent';

function lastSeen(iso: string | null, locale: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function NudgeButton({ member }: { member: AtRiskMember }) {
  const t = useTranslations('pro.dashboard.atRisk');
  if (!member.email) return null;
  const subject = encodeURIComponent(t('nudgeSubject'));
  const body = encodeURIComponent(t('nudgeBody', { name: member.username ?? '' }));
  return (
    <a
      href={`mailto:${member.email}?subject=${subject}&body=${body}`}
      onClick={() =>
        trackEvent(ANALYTICS_EVENTS.retentionNudgeClicked, {
          risk: member.risk,
          daysInactive: member.daysInactive,
        })
      }
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-foreground hover:bg-muted"
    >
      <Mail className="h-3 w-3" aria-hidden />
      {t('nudge')}
    </a>
  );
}

/**
 * V4-04 — the retention block: members who used to train and have gone quiet.
 * Incumbents tell you who paid; this tells you who you're about to lose.
 */
export function AtRiskPanel() {
  const t = useTranslations('pro.dashboard.atRisk');
  const locale = useLocale();
  const { state } = useAsyncResource(listAtRiskMembers, []);

  const count = state.status === 'ready' ? state.data.length : 0;
  useEffect(() => {
    if (state.status === 'ready') {
      trackEvent(ANALYTICS_EVENTS.retentionDashboardViewed, { count });
    }
  }, [state.status, count]);

  if (state.status !== 'ready') return null;

  if (state.data.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('title')}
        </p>
        <p className="mt-1 text-sm text-emerald-500">{t('allGood')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {t('titleCount', { count: state.data.length })}
        </p>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{t('intro')}</p>

      <ul className="mt-3 divide-y divide-border/60">
        {state.data.slice(0, 6).map((m) => (
          <li key={m.userId} className="flex items-center gap-3 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black">
              {(m.username ?? '?').slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{m.username ?? '—'}</span>
              <span className="block text-xs text-muted-foreground">
                {t('inactiveFor', { days: m.daysInactive })} · {t('lastSeen')}{' '}
                {lastSeen(m.lastActivityAt, locale)}
              </span>
            </span>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] ${
                m.risk === 'high'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-amber-500/20 text-amber-500'
              }`}
            >
              {t(`risk.${m.risk}`)}
            </span>
            <NudgeButton member={m} />
          </li>
        ))}
      </ul>
      {state.data.length > 6 ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          {t('more', { count: state.data.length - 6 })}
        </p>
      ) : null}
    </div>
  );
}
