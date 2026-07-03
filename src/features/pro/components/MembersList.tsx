'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { listGymMembers, type GymMember } from '@/features/pro/services/members';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function initials(name: string | null): string {
  return name ? name.slice(0, 2).toUpperCase() : '?';
}

function lastActiveLabel(iso: string | null, locale: string, never: string): string {
  if (!iso) return never;
  return new Date(iso).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MemberRow({ member }: { member: GymMember }) {
  const locale = useLocale();
  const t = useTranslations('pro.members');
  const isHorde = member.faction === 'horde';

  const inner = (
    <>
      <span
        aria-hidden
        className={`h-2 w-2 shrink-0 rounded-full ${isHorde ? 'bg-[var(--faction-horde)]' : 'bg-sky-500'}`}
      />
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black">
        {initials(member.username)}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{member.username ?? '—'}</span>
      {member.division ? (
        <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          {member.division}
        </span>
      ) : null}
      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground">
        {lastActiveLabel(member.lastActivityAt, locale, t('never'))}
      </span>
      {member.username ? (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </>
  );

  // A member is an athlete → link to their public B2C profile.
  return (
    <li className="border-b border-border last:border-b-0">
      {member.username ? (
        <Link
          href={`/${locale}/app/u/${member.username}`}
          target="_blank"
          rel="noopener noreferrer"
          title={t('openProfile')}
          className="flex items-center gap-3 px-3 py-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-3 py-3">{inner}</div>
      )}
    </li>
  );
}

export function MembersList() {
  const t = useTranslations('pro.members');
  const { state } = useAsyncResource(listGymMembers, []);

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const members = state.data;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>
      {members.length === 0 ? (
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('count', { count: members.length })}
          </p>
          <ul className="rounded-md border border-border bg-card">
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
