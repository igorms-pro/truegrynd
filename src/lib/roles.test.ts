import { describe, expect, it } from 'vitest';

import {
  canAccessPro,
  isGymManager,
  isGymStaff,
  isPlatformAdmin,
  type RoleSource,
} from '@/lib/roles';

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

  it('isGymManager: gym_admin or platform admin, but NOT a plain coach', () => {
    expect(isGymManager(make('gym_admin'))).toBe(true);
    expect(isGymManager(make('platform_admin'))).toBe(true);
    expect(isGymManager(make('coach', true))).toBe(true); // platform admin via legacy flag
    expect(isGymManager(make('coach'))).toBe(false);
    expect(isGymManager(make('athlete'))).toBe(false);
    expect(isGymManager(null)).toBe(false);
  });
});
