'use client';

import { BadgeCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { FilterSelect } from '@/components/FilterSelect';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { listGymMembers, type GymMember } from '@/features/pro/services/members';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { canAccessPro } from '@/lib/roles';

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

const SEX_FILTERS = ['all', 'male', 'female'] as const;
type SexFilter = (typeof SEX_FILTERS)[number];

const PROOF_FILTERS = ['all', 'verified'] as const;
type ProofFilter = (typeof PROOF_FILTERS)[number];

/** Churn lens: active = trained in the last 30 days. */
const ACTIVITY_FILTERS = ['all', 'active', 'inactive'] as const;
type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

function isActive30d(lastActivityAt: string | null): boolean {
  if (!lastActivityAt) return false;
  return Date.now() - new Date(lastActivityAt).getTime() < 30 * 24 * 3600 * 1000;
}

/** Hyrox-style age buckets — the same cuts event divisions will use later. */
const AGE_CATS = ['u24', 'a2534', 'a3544', 'm45'] as const;
type AgeCat = (typeof AGE_CATS)[number];

function ageCategory(age: number | null): AgeCat | null {
  if (age == null) return null;
  if (age < 25) return 'u24';
  if (age < 35) return 'a2534';
  if (age < 45) return 'a3544';
  return 'm45';
}

function MemberRow({ member }: { member: GymMember }) {
  const locale = useLocale();
  const t = useTranslations('pro.members');
  const isHorde = member.faction === 'horde';

  const inner = (
    <>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-black">
        {initials(member.username)}
        <span
          aria-hidden
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
            isHorde ? 'bg-[var(--faction-horde)]' : 'bg-sky-500'
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold">{member.username ?? '—'}</span>
          {member.verifiedCount > 0 ? (
            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
          ) : null}
        </span>
        <span className="block text-xs text-muted-foreground sm:hidden">
          {member.division ?? '—'}
        </span>
      </span>
      <span className="hidden w-24 shrink-0 sm:block">
        {member.division ? (
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">
            {member.division}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </span>
      <span className="hidden w-20 shrink-0 text-xs text-muted-foreground md:block">
        {member.sex === 'male' ? t('sex.male') : member.sex === 'female' ? t('sex.female') : '—'}
        {member.age != null ? ` · ${member.age}` : ''}
      </span>
      <span className="hidden w-20 shrink-0 text-xs tabular-nums text-muted-foreground lg:block">
        {member.weightKg != null ? t('weightValue', { kg: member.weightKg }) : '—'}
      </span>
      <span className="hidden w-20 shrink-0 text-right text-xs tabular-nums lg:block">
        {member.verifiedCount > 0 ? (
          <span className="font-black text-emerald-500">{member.verifiedCount}</span>
        ) : (
          <span className="text-muted-foreground">0</span>
        )}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {lastActiveLabel(member.lastActivityAt, locale, t('never'))}
      </span>
      {member.username ? (
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}
    </>
  );

  // A member is an athlete → link to their public B2C profile (new tab, /pro stays put).
  return (
    <li className="border-b border-border last:border-b-0">
      {member.username ? (
        <Link
          href={`/${locale}/app/u/${member.username}`}
          target="_blank"
          rel="noopener noreferrer"
          title={t('openProfile')}
          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {inner}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
      )}
    </li>
  );
}

export function MembersList() {
  const t = useTranslations('pro.members');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const { state } = useAsyncResource(listGymMembers, []);
  const [query, setQuery] = useState('');
  const [sexFilter, setSexFilter] = useState<SexFilter>('all');
  const [proofFilter, setProofFilter] = useState<ProofFilter>('all');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');

  const members = useMemo(() => (state.status === 'ready' ? state.data : []), [state]);

  const divisions = useMemo(
    () =>
      [...new Set(members.map((m) => m.division).filter((d): d is string => Boolean(d)))].sort(),
    [members],
  );

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      members.filter((m) => {
        if (q && !(m.username ?? '').toLowerCase().includes(q)) return false;
        if (sexFilter !== 'all' && m.sex !== sexFilter) return false;
        if (proofFilter === 'verified' && m.verifiedCount === 0) return false;
        if (activityFilter === 'active' && !isActive30d(m.lastActivityAt)) return false;
        if (activityFilter === 'inactive' && isActive30d(m.lastActivityAt)) return false;
        if (divisionFilter && m.division !== divisionFilter) return false;
        if (ageFilter && ageCategory(m.age) !== ageFilter) return false;
        return true;
      }),
    [members, q, sexFilter, proofFilter, activityFilter, divisionFilter, ageFilter],
  );

  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const header = (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('intro')}</p>
      </div>
      {canAccessPro(profile) ? (
        <Link
          href={`/${locale}/app/pro/members/import`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-foreground hover:bg-muted"
        >
          {t('importCta')}
        </Link>
      ) : null}
    </header>
  );

  if (members.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t('empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}

      <div className="space-y-3 rounded-md border border-border bg-card p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={t('filterSexLabel')}
            className="inline-flex overflow-hidden rounded-md border border-border"
          >
            {SEX_FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setSexFilter(f)}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                  i > 0 ? 'border-l border-border' : ''
                } ${
                  sexFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`filterSex.${f}`)}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t('filterProofLabel')}
            className="inline-flex overflow-hidden rounded-md border border-border"
          >
            {PROOF_FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setProofFilter(f)}
                className={`inline-flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                  i > 0 ? 'border-l border-border' : ''
                } ${
                  proofFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'verified' ? <BadgeCheck className="h-3 w-3" aria-hidden /> : null}
                {t(`filterProof.${f}`)}
              </button>
            ))}
          </div>
          <div
            role="group"
            aria-label={t('filterActivityLabel')}
            className="inline-flex overflow-hidden rounded-md border border-border"
          >
            {ACTIVITY_FILTERS.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setActivityFilter(f)}
                className={`px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-colors ${
                  i > 0 ? 'border-l border-border' : ''
                } ${
                  activityFilter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`filterActivity.${f}`)}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchPlaceholder')}
            className="min-w-[10rem] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <FilterSelect
            value={ageFilter}
            onChange={setAgeFilter}
            options={AGE_CATS.map((c) => ({ value: c, label: t(`ageCat.${c}`) }))}
            allLabel={t('allAges')}
            ariaLabel={t('filterAgeLabel')}
            className="w-44"
          />
          {divisions.length > 1 ? (
            <FilterSelect
              value={divisionFilter}
              onChange={setDivisionFilter}
              options={divisions.map((d) => ({ value: d, label: d }))}
              allLabel={t('allDivisions')}
              ariaLabel={t('filterDivisionLabel')}
              className="w-48"
            />
          ) : null}
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
          {t('count', { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
          {t('noMatch')}
        </p>
      ) : (
        <ul className="rounded-md border border-border bg-card">
          <li className="flex items-center gap-3 border-b border-border px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            <span className="w-9 shrink-0" />
            <span className="min-w-0 flex-1">{t('colAthlete')}</span>
            <span className="hidden w-24 shrink-0 sm:block">{t('colDivision')}</span>
            <span className="hidden w-20 shrink-0 md:block">{t('colSexAge')}</span>
            <span className="hidden w-20 shrink-0 lg:block">{t('colWeight')}</span>
            <span className="hidden w-20 shrink-0 text-right lg:block">{t('colVerified')}</span>
            <span className="w-24 shrink-0 text-right">{t('colLastActive')}</span>
            <span className="w-3.5 shrink-0" />
          </li>
          {filtered.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      )}
    </div>
  );
}
