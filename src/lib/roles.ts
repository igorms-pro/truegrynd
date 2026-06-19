import type { UserRole } from '@/lib/types/database.types';

/** Minimal shape needed to resolve access — a `Profile` satisfies it. */
export type RoleSource = { role: UserRole; is_admin: boolean };

/** Platform admin (the `/admin` backoffice). `is_admin` kept for back-compat with pre-V3 rows. */
export function isPlatformAdmin(profile: RoleSource | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === 'platform_admin' || profile.is_admin;
}

/** Gym-side staff: a coach or a gym admin. */
export function isGymStaff(profile: RoleSource | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === 'coach' || profile.role === 'gym_admin';
}

/** Can enter the PRO space (`/pro`): gym staff, or a platform admin overseeing it. */
export function canAccessPro(profile: RoleSource | null | undefined): boolean {
  return isGymStaff(profile) || isPlatformAdmin(profile);
}

/**
 * Can manage the gym itself (settings, billing, subscriptions) — a gym admin or
 * platform admin. A plain `coach` accesses `/pro` but not these owner-only sections.
 */
export function isGymManager(profile: RoleSource | null | undefined): boolean {
  if (!profile) return false;
  return profile.role === 'gym_admin' || isPlatformAdmin(profile);
}
