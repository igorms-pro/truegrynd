import { supabase } from '@/lib/supabase';

export type BillingStatus = {
  gymId: string;
  gymName: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'none';
  currentPeriodEnd: string | null;
  isActive: boolean;
};

type Row = {
  gym_id: string;
  gym_name: string;
  subscription_status: BillingStatus['status'];
  current_period_end: string | null;
  is_active: boolean;
};

export async function getBillingStatus(): Promise<BillingStatus | null> {
  const { data, error } = await supabase.rpc('gym_billing_status').maybeSingle<Row>();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    gymId: data.gym_id,
    gymName: data.gym_name,
    status: data.subscription_status,
    currentPeriodEnd: data.current_period_end,
    isActive: data.is_active,
  };
}

/** Opens Stripe Checkout (subscribe) or the Billing Portal (manage); returns the hosted URL. */
async function stripeSession(action: 'checkout' | 'portal', returnUrl: string): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('no_session');

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!baseUrl || !anonKey) throw new Error('server_misconfigured');

  const res = await fetch(`${baseUrl}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ action, returnUrl }),
  });
  const parsed = (await res.json().catch(() => ({}))) as { url?: string; code?: string };
  if (!res.ok || !parsed.url) throw new Error(parsed.code ?? `http_${res.status}`);
  return parsed.url;
}

export async function startCheckout(returnUrl: string): Promise<string> {
  return stripeSession('checkout', returnUrl);
}

export async function openPortal(returnUrl: string): Promise<string> {
  return stripeSession('portal', returnUrl);
}
