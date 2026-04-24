export function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get('debug') === '1';
  const isLocalhost =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0';
  return fromQuery || (process.env.NODE_ENV !== 'production' && isLocalhost);
}
