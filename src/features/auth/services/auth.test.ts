import { describe, expect, it, vi, beforeEach } from 'vitest';

import { supabase } from '@/lib/supabase';
import { signInWithMagicLink, signInWithOAuth, signOut } from './auth';

interface MockAuth {
  signInWithOtp: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
}

vi.mock('@/lib/supabase', () => {
  const auth: MockAuth = {
    signInWithOtp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  };
  return { supabase: { auth } };
});

const mockedAuth = (supabase as unknown as { auth: MockAuth }).auth;

describe('auth services', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('signInWithMagicLink forwards email and redirect URL', async () => {
    mockedAuth.signInWithOtp.mockResolvedValue({ error: null });

    await signInWithMagicLink('test@example.com', 'http://localhost:3000/en/auth');

    expect(mockedAuth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: 'http://localhost:3000/en/auth',
      },
    });
  });

  it('signInWithOAuth forwards provider and redirect URL', async () => {
    mockedAuth.signInWithOAuth.mockResolvedValue({ error: null });

    await signInWithOAuth('google', 'http://localhost:3000/en/auth');

    expect(mockedAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/en/auth',
      },
    });
  });

  it('signOut delegates to Supabase', async () => {
    mockedAuth.signOut.mockResolvedValue({ error: null });

    await signOut();

    expect(mockedAuth.signOut).toHaveBeenCalledTimes(1);
  });
});
