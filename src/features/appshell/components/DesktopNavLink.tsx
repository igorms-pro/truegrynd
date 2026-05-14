'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

function navLinkClassName(isActive: boolean): string {
  return [
    'relative px-1 py-2 text-xs font-black uppercase tracking-[0.18em] transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
  ].join(' ');
}

type Props = {
  href: string;
  isActive: boolean;
  children: ReactNode;
};

export function DesktopNavLink({ href, isActive, children }: Props) {
  return (
    <Link
      href={href}
      className={navLinkClassName(isActive)}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-[5px] left-0 right-0 h-[2px] bg-primary"
        />
      ) : null}
    </Link>
  );
}
