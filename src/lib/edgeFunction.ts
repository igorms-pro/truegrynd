import { supabase } from '@/lib/supabase';

/**
 * Call a Supabase Edge Function with the current user's JWT. Returns the parsed JSON body.
 * Throws the server `code` (e.g. `not_gym_admin`) on a non-2xx response, else `http_<status>`.
 * One place for the auth + base-URL + fetch boilerplate shared by every edge-function caller.
 */
export async function callEdgeFunction<T = Record<string, unknown>>(
  name: string,
  body: unknown,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('no_session');

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!baseUrl || !anonKey) throw new Error('server_misconfigured');

  const res = await fetch(`${baseUrl}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  });

  const parsed = (await res.json().catch(() => ({}))) as T & { code?: string };
  if (!res.ok) throw new Error(parsed.code ?? `http_${res.status}`);
  return parsed;
}
