/**
 * PostgREST sometimes returns a many-to-one FK embed as an object, sometimes as a single-element array.
 */
export function normalizePostgrestCreator(raw: unknown): { username: string | null } | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    const first = raw[0] as { username?: string | null } | undefined;
    return first ? { username: first.username ?? null } : null;
  }
  const o = raw as { username?: string | null };
  return { username: o.username ?? null };
}
