import Link from 'next/link';

const BASE =
  'inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-black uppercase tracking-[0.18em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Full-width primary (red) call-to-action link. */
export function PrimaryButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className={`${BASE} bg-primary text-primary-foreground hover:opacity-90`}>
      {label}
    </Link>
  );
}

/** Full-width secondary (outlined) link — quieter than the primary CTA. */
export function SecondaryButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`${BASE} border border-border bg-background text-foreground hover:bg-muted`}
    >
      {label}
    </Link>
  );
}
