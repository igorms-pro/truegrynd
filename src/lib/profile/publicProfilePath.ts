export function publicProfilePath(locale: string, username: string): string {
  return `/${locale}/app/u/${encodeURIComponent(username)}`;
}
