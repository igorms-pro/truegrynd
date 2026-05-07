export function normalizeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/')) return null;
  return next;
}

export function buildNextUrl(input: { basePath: string; next: string }): string {
  return `${input.basePath}?next=${encodeURIComponent(input.next)}`;
}
