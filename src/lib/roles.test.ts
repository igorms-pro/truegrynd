import { describe, expect, it } from 'vitest';

import { canAccessPro, isGymStaff, isPlatformAdmin, type RoleSource } from '@/lib/roles';

const make = (role: RoleSource['role'], is_admin = false): RoleSource => ({ role, is_admin });

describe('roles', () => {
  it('isPlatformAdmin: true for platform_admin role or legacy is_admin flag', () => {
    expect(isPlatformAdmin(make('platform_admin'))).toBe(true);
    expect(isPlatformAdmin(make('athlete', true))).toBe(true); // back-compat
    expect(isPlatformAdmin(make('athlete'))).toBe(false);
    expect(isPlatformAdmin(make('coach'))).toBe(false);
    expect(isPlatformAdmin(null)).toBe(false);
  });

  it('isGymStaff: true for coach and gym_admin only', () => {
    expect(isGymStaff(make('coach'))).toBe(true);
    expect(isGymStaff(make('gym_admin'))).toBe(true);
    expect(isGymStaff(make('athlete'))).toBe(false);
    expect(isGymStaff(make('platform_admin'))).toBe(false);
    expect(isGymStaff(undefined)).toBe(false);
  });

  it('canAccessPro: gym staff or platform admin', () => {
    expect(canAccessPro(make('coach'))).toBe(true);
    expect(canAccessPro(make('gym_admin'))).toBe(true);
    expect(canAccessPro(make('platform_admin'))).toBe(true);
    expect(canAccessPro(make('athlete'))).toBe(false);
    expect(canAccessPro(make('athlete', true))).toBe(true); // platform admin via legacy flag
  });
});
