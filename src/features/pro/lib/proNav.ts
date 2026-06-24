import {
  LayoutDashboard,
  Gavel,
  Trophy,
  Tv,
  CalendarDays,
  Users,
  Ticket,
  Settings,
  CreditCard,
  type LucideIcon,
} from 'lucide-react';

/** `live` = built & navigable. `soon` = shown but disabled (vision placeholder). */
export type ProNavStatus = 'live' | 'soon';

export type ProNavItem = {
  id: string;
  /** Path under /{locale}, starting with `/app/pro`. Empty suffix = the PRO home. */
  path: `/app/pro${string}`;
  icon: LucideIcon;
  /** i18n key under the `pro.nav` namespace. */
  labelKey: string;
  status: ProNavStatus;
  /** Owner-only section (gym_admin / platform admin). Hidden for a plain coach. */
  managerOnly?: boolean;
};

export type ProNavGroup = {
  id: string;
  /** i18n key under `pro.nav.groups`, or null for the top (ungrouped) item. */
  labelKey: string | null;
  items: readonly ProNavItem[];
};

export const PRO_NAV: readonly ProNavGroup[] = [
  {
    id: 'main',
    labelKey: null,
    items: [
      {
        id: 'dashboard',
        path: '/app/pro',
        icon: LayoutDashboard,
        labelKey: 'dashboard',
        status: 'live',
      },
    ],
  },
  {
    id: 'competition',
    labelKey: 'competition',
    items: [
      { id: 'judge', path: '/app/pro/judge', icon: Gavel, labelKey: 'judge', status: 'live' },
      { id: 'events', path: '/app/pro/events', icon: Trophy, labelKey: 'events', status: 'live' },
      { id: 'tv', path: '/app/pro/tv', icon: Tv, labelKey: 'tv', status: 'live' },
    ],
  },
  {
    id: 'management',
    labelKey: 'management',
    items: [
      {
        id: 'planning',
        path: '/app/pro/planning',
        icon: CalendarDays,
        labelKey: 'planning',
        status: 'soon',
      },
      { id: 'members', path: '/app/pro/members', icon: Users, labelKey: 'members', status: 'live' },
      {
        id: 'subscriptions',
        path: '/app/pro/subscriptions',
        icon: Ticket,
        labelKey: 'subscriptions',
        status: 'soon',
        managerOnly: true,
      },
      {
        id: 'settings',
        path: '/app/pro/settings',
        icon: Settings,
        labelKey: 'settings',
        status: 'soon',
        managerOnly: true,
      },
      {
        id: 'billing',
        path: '/app/pro/billing',
        icon: CreditCard,
        labelKey: 'billing',
        status: 'soon',
        managerOnly: true,
      },
    ],
  },
] as const;

/** Exact-match for the PRO home, prefix-match for sub-routes. */
export function isProItemActive(pathname: string, locale: string, item: ProNavItem): boolean {
  const localized = `/${locale}${item.path}`;
  if (item.path === '/app/pro') return pathname === localized;
  return pathname === localized || pathname.startsWith(`${localized}/`);
}
