export function normalizeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  return next;
}

export function buildNextUrl(input: { basePath: string; next: string }): string {
  return `${input.basePath}?next=${encodeURIComponent(input.next)}`;
}

export function buildAuthUrl(input: {
  basePath: string;
  next: string;
  reason?: 'session_expired' | 'signed_out';
}): string {
  const url = new URL(input.basePath, 'http://local');
  url.searchParams.set('next', input.next);
  if (input.reason) url.searchParams.set('reason', input.reason);
  return `${input.basePath}?${url.searchParams.toString()}`;
}
