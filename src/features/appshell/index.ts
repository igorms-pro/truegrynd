export { AppShell } from '@/features/appshell/components/AppShell';
export { DesktopNavLink } from '@/features/appshell/components/DesktopNavLink';
export {
  AppProfileProvider,
  useOptionalAppProfile,
} from '@/features/appshell/context/AppProfileContext';
export { useRequireAppAccess } from '@/features/appshell/hooks/useRequireAppAccess';
export { APP_TABS, isTabActive } from '@/features/appshell/lib/tabs';
export type { AppTab, AppTabId } from '@/features/appshell/lib/tabs';
