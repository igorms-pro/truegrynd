import { supabase } from '@/lib/supabase';

export type OAuthProvider = 'google' | 'apple';

export async function signInWithMagicLink(email: string, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Must be allow-listed in Supabase Auth settings.
      emailRedirectTo: redirectTo,
    },
  });

  if (error) throw error;
}

export async function signInWithOAuth(provider: OAuthProvider, redirectTo: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
