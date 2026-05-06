export function initialsFromUsername(username: string | null): string {
  const raw = (username ?? '').trim();
  if (!raw) return 'TG';
  const parts = raw.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? raw[0] ?? 'T';
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? 'G';
  return `${a}${b}`.toUpperCase();
}
