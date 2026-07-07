'use client';

import { Infinity as InfinityIcon, Plus, Ticket, UserPlus, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { FilterSelect } from '@/components/FilterSelect';
import { useOptionalAppProfile } from '@/features/appshell/context/AppProfileContext';
import { FORM_INPUT_CLASS } from '@/features/pro/lib/formStyles';
import { listGymMembers } from '@/features/pro/services/members';
import {
  assignPlan,
  cancelMemberPlan,
  createPlan,
  listMemberPlans,
  listPlans,
  PLAN_KINDS,
  togglePlan,
  type MembershipPlan,
  type MembershipPlanInput,
  type PlanKind,
} from '@/features/pro/services/memberships';
import { useAsyncResource } from '@/hooks/useAsyncResource';

function priceLabel(cents: number | null, locale: string): string | null {
  if (cents == null) return null;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function PlanForm({ onSaved, onClose }: { onSaved: () => void; onClose: () => void }) {
  const t = useTranslations('pro.subscriptions');
  const profile = useOptionalAppProfile();
  const [form, setForm] = useState<MembershipPlanInput>({
    name: '',
    kind: 'unlimited',
    priceCents: null,
    credits: 10,
    validityDays: 30,
  });
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function save() {
    if (form.name.trim().length < 2 || !profile?.affiliated_gym_id) return;
    setBusy(true);
    setError(false);
    try {
      const cents = price.trim() === '' ? null : Math.round(Number(price.replace(',', '.')) * 100);
      await createPlan(profile.affiliated_gym_id, {
        ...form,
        priceCents: Number.isFinite(cents) ? cents : null,
      });
      onSaved();
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-md border border-border bg-card p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.name')}
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={t('form.namePlaceholder')}
            className={FORM_INPUT_CLASS}
          />
        </label>
        <div className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.kind')}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PLAN_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setForm((f) => ({ ...f, kind: k as PlanKind }))}
                className={`rounded-sm px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${
                  form.kind === k
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`kinds.${k}`)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.price')}
          <input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="79,90"
            className={FORM_INPUT_CLASS}
          />
        </label>
        {form.kind === 'credits' ? (
          <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            {t('form.credits')}
            <input
              type="number"
              min={1}
              max={1000}
              value={form.credits ?? 10}
              onChange={(e) =>
                setForm((f) => ({ ...f, credits: Math.max(1, Number(e.target.value) || 1) }))
              }
              className={FORM_INPUT_CLASS}
            />
          </label>
        ) : null}
        <label className="block text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('form.validity')}
          <input
            type="number"
            min={1}
            max={730}
            value={form.validityDays ?? 30}
            onChange={(e) =>
              setForm((f) => ({ ...f, validityDays: Math.max(1, Number(e.target.value) || 30) }))
            }
            className={FORM_INPUT_CLASS}
          />
        </label>
      </div>
      {error ? <p className="text-xs font-semibold text-primary">{t('form.error')}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy || form.name.trim().length < 2}
          onClick={save}
          className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('form.saving') : t('form.create')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {t('form.cancel')}
        </button>
      </div>
    </div>
  );
}

export function SubscriptionsScreen() {
  const t = useTranslations('pro.subscriptions');
  const locale = useLocale();
  const profile = useOptionalAppProfile();
  const gymId = profile?.affiliated_gym_id ?? null;

  const load = useCallback(async () => {
    const [plans, memberPlans, members] = await Promise.all([
      listPlans(gymId ?? ''),
      listMemberPlans(gymId ?? ''),
      listGymMembers(),
    ]);
    return { plans, memberPlans, members };
  }, [gymId]);
  const { state, refetch } = useAsyncResource(load, [gymId ?? ''], { enabled: gymId !== null });
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<MembershipPlan | null>(null);
  const [assignee, setAssignee] = useState('');
  const [actionError, setActionError] = useState(false);

  if (!gymId) return <p className="text-sm text-muted-foreground">{t('noGym')}</p>;
  if (state.status === 'loading' || state.status === 'idle') {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (state.status === 'error') {
    return <p className="text-sm font-semibold text-primary">{t('error')}</p>;
  }

  const { plans, memberPlans, members } = state.data;
  const assignedIds = new Set(memberPlans.map((mp) => mp.userId));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight md:text-3xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {!creating ? (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('addPlan')}
          </button>
        ) : null}
      </header>

      {creating ? (
        <PlanForm
          onSaved={() => {
            setCreating(false);
            refetch();
          }}
          onClose={() => setCreating(false)}
        />
      ) : null}

      {plans.length === 0 && !creating ? (
        <div className="space-y-4 rounded-md border border-dashed border-border bg-muted/20 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em]">{t('emptyTitle')}</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{t('emptyBody')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`space-y-3 rounded-md border border-border bg-card p-4 ${p.isActive ? '' : 'opacity-50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-black uppercase tracking-[0.12em]">{p.name}</p>
                <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">
                  {p.kind === 'unlimited' ? (
                    <InfinityIcon className="h-3 w-3" aria-hidden />
                  ) : (
                    <Ticket className="h-3 w-3" aria-hidden />
                  )}
                  {t(`kinds.${p.kind}`)}
                </span>
              </div>
              <p className="text-2xl font-black tabular-nums">
                {priceLabel(p.priceCents, locale) ?? '—'}
                {p.validityDays ? (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {' '}
                    / {t('days', { days: p.validityDays })}
                  </span>
                ) : null}
              </p>
              {p.kind === 'credits' && p.credits ? (
                <p className="text-xs text-muted-foreground">
                  {t('creditsIncluded', { count: p.credits })}
                </p>
              ) : null}
              <div className="flex gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setAssigning(p);
                    setAssignee('');
                  }}
                  className="inline-flex items-center gap-1 rounded-sm bg-primary px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90"
                >
                  <UserPlus className="h-3 w-3" aria-hidden />
                  {t('assign')}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await togglePlan(p.id, !p.isActive);
                    refetch();
                  }}
                  className="rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                >
                  {p.isActive ? t('deactivate') : t('activate')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigning ? (
        <div className="space-y-3 rounded-md border border-border border-l-2 border-l-primary bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em]">
            {t('assignTitle', { plan: assigning.name })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={assignee}
              onChange={setAssignee}
              options={members
                .filter((m) => m.username && !assignedIds.has(m.id))
                .map((m) => ({ value: m.id, label: m.username ?? m.id }))}
              allLabel={t('assignPlaceholder')}
              ariaLabel={t('assignTitle', { plan: assigning.name })}
              className="w-64"
            />
            <button
              type="button"
              disabled={!assignee}
              onClick={async () => {
                setActionError(false);
                try {
                  await assignPlan(gymId, assigning, assignee);
                  setAssigning(null);
                  refetch();
                } catch {
                  setActionError(true);
                }
              }}
              className="rounded-md bg-primary px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {t('assignConfirm')}
            </button>
            <button
              type="button"
              onClick={() => setAssigning(null)}
              className="rounded-md border border-border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
            >
              {t('form.cancel')}
            </button>
          </div>
          {actionError ? (
            <p className="text-xs font-semibold text-primary">{t('assignError')}</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {t('assignedTitle', { count: memberPlans.length })}
        </h2>
        {memberPlans.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            {t('assignedEmpty')}
          </p>
        ) : (
          <ul className="rounded-md border border-border bg-card">
            {memberPlans.map((mp) => (
              <li
                key={mp.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                  {(mp.username ?? '?').slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  {mp.username ?? '—'}
                </span>
                <span className="hidden shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground sm:block">
                  {mp.planName}
                </span>
                {mp.creditsLeft != null ? (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {t('creditsLeft', { count: mp.creditsLeft })}
                  </span>
                ) : null}
                <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground md:block">
                  {mp.expiresAt ?? '∞'}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await cancelMemberPlan(mp.id);
                    refetch();
                  }}
                  aria-label={t('unassign')}
                  title={t('unassign')}
                  className="shrink-0 rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t('connectNote')}</p>
    </div>
  );
}
