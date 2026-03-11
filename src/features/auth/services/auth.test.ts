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
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    await signInWithMagicLink('test@example.com');

    expect(mockedAuth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: 'http://localhost:3000',
      },
    });
  });

  it('signInWithOAuth forwards provider and redirect URL', async () => {
    mockedAuth.signInWithOAuth.mockResolvedValue({ error: null });
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });

    await signInWithOAuth('google');

    expect(mockedAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000',
      },
    });
  });

  it('signOut delegates to Supabase', async () => {
    mockedAuth.signOut.mockResolvedValue({ error: null });

    await signOut();

    expect(mockedAuth.signOut).toHaveBeenCalledTimes(1);
  });
});
