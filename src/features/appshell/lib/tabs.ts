import { Activity, Swords, ShieldHalf, UserRound, type LucideIcon } from 'lucide-react';

export type AppTabId = 'overview' | 'arena' | 'clan' | 'profile';

export type AppTab = {
  id: AppTabId;
  /** Path under /{locale}, starting with `/app/...` */
  path: `/app/${string}`;
  icon: LucideIcon;
  /** i18n key under the `app.tabs` namespace. */
  labelKey: AppTabId;
};

export const APP_TABS: readonly AppTab[] = [
  { id: 'overview', path: '/app/overview', icon: Activity, labelKey: 'overview' },
  { id: 'arena', path: '/app/arena', icon: Swords, labelKey: 'arena' },
  { id: 'clan', path: '/app/clan', icon: ShieldHalf, labelKey: 'clan' },
  { id: 'profile', path: '/app/profile', icon: UserRound, labelKey: 'profile' },
] as const;

export function isTabActive(pathname: string, locale: string, tab: AppTab): boolean {
  const localized = `/${locale}${tab.path}`;
  return pathname === localized || pathname.startsWith(`${localized}/`);
}
