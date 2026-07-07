import { supabase } from '@/lib/supabase';

export const PLAN_KINDS = ['unlimited', 'credits', 'dropin'] as const;
export type PlanKind = (typeof PLAN_KINDS)[number];

/** One of the gym's own offers (see `gym_membership_plans` / V4-05). */
export type MembershipPlan = {
  id: string;
  gymId: string;
  name: string;
  kind: PlanKind;
  priceCents: number | null;
  currency: string;
  credits: number | null;
  validityDays: number | null;
  isActive: boolean;
};

export type MembershipPlanInput = {
  name: string;
  kind: PlanKind;
  priceCents: number | null;
  credits: number | null;
  validityDays: number | null;
};

type PlanRow = {
  id: string;
  gym_id: string;
  name: string;
  kind: PlanKind;
  price_cents: number | null;
  currency: string;
  credits: number | null;
  validity_days: number | null;
  is_active: boolean;
};

const PLAN_COLUMNS =
  'id, gym_id, name, kind, price_cents, currency, credits, validity_days, is_active';

function planFromRow(r: PlanRow): MembershipPlan {
  return {
    id: r.id,
    gymId: r.gym_id,
    name: r.name,
    kind: r.kind,
    priceCents: r.price_cents,
    currency: r.currency,
    credits: r.credits,
    validityDays: r.validity_days,
    isActive: r.is_active,
  };
}

export async function listPlans(gymId: string): Promise<MembershipPlan[]> {
  const { data, error } = await supabase
    .from('gym_membership_plans')
    .select(PLAN_COLUMNS)
    .eq('gym_id', gymId)
    .order('created_at');
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlanRow[]).map(planFromRow);
}

export async function createPlan(gymId: string, input: MembershipPlanInput): Promise<void> {
  const { error } = await supabase.from('gym_membership_plans').insert({
    gym_id: gymId,
    name: input.name,
    kind: input.kind,
    price_cents: input.priceCents,
    credits: input.kind === 'credits' ? input.credits : null,
    validity_days: input.validityDays,
  });
  if (error) throw new Error(error.message);
}

export async function togglePlan(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('gym_membership_plans')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** A member's assigned plan (joined for the managers' list). */
export type MemberPlan = {
  id: string;
  userId: string;
  username: string | null;
  planId: string;
  planName: string;
  kind: PlanKind;
  status: 'active' | 'expired' | 'cancelled';
  creditsLeft: number | null;
  startedAt: string;
  expiresAt: string | null;
};

type MemberPlanRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  credits_left: number | null;
  started_at: string;
  expires_at: string | null;
  gym_membership_plans: { name: string; kind: PlanKind } | null;
  profiles: { username: string | null } | null;
};

export async function listMemberPlans(gymId: string): Promise<MemberPlan[]> {
  const { data, error } = await supabase
    .from('gym_member_plans')
    .select(
      'id, user_id, plan_id, status, credits_left, started_at, expires_at, gym_membership_plans(name, kind), profiles(username)',
    )
    .eq('gym_id', gymId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as MemberPlanRow[]).map((r) => ({
    id: r.id,
    userId: r.user_id,
    username: r.profiles?.username ?? null,
    planId: r.plan_id,
    planName: r.gym_membership_plans?.name ?? '—',
    kind: r.gym_membership_plans?.kind ?? 'unlimited',
    status: r.status,
    creditsLeft: r.credits_left,
    startedAt: r.started_at,
    expiresAt: r.expires_at,
  }));
}

/** Assign a plan to a member (one active plan per member — cancels nothing, DB enforces). */
export async function assignPlan(
  gymId: string,
  plan: MembershipPlan,
  userId: string,
): Promise<void> {
  const expires =
    plan.validityDays == null
      ? null
      : new Date(Date.now() + plan.validityDays * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const { error } = await supabase.from('gym_member_plans').insert({
    gym_id: gymId,
    plan_id: plan.id,
    user_id: userId,
    credits_left: plan.kind === 'credits' ? plan.credits : null,
    expires_at: expires,
  });
  if (error) throw new Error(error.message);
}

export async function cancelMemberPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('gym_member_plans')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** The caller's own active plan (member view, "Ma salle"). */
export async function getMyPlan(): Promise<MemberPlan | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('gym_member_plans')
    .select(
      'id, user_id, plan_id, status, credits_left, started_at, expires_at, gym_membership_plans(name, kind), profiles(username)',
    )
    .eq('user_id', uid)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const r = data as unknown as MemberPlanRow;
  return {
    id: r.id,
    userId: r.user_id,
    username: r.profiles?.username ?? null,
    planId: r.plan_id,
    planName: r.gym_membership_plans?.name ?? '—',
    kind: r.gym_membership_plans?.kind ?? 'unlimited',
    status: r.status,
    creditsLeft: r.credits_left,
    startedAt: r.started_at,
    expiresAt: r.expires_at,
  };
}
