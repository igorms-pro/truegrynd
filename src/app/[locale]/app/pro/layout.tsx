import type { ReactNode } from 'react';

// The PRO chrome (sidebar, guard, subscription gate) is provided by ProShell,
// rendered from AppShell for every /pro route. This layout is a passthrough.
export default function ProLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
