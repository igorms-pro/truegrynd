function safeParseUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url;
  } catch {
    return null;
  }
}

function isYouTubeUrl(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') return url.pathname.length > 1;
  if (host !== 'youtube.com') return false;

  if (url.pathname === '/watch') return !!url.searchParams.get('v');
  if (url.pathname.startsWith('/shorts/')) return url.pathname.length > '/shorts/'.length;
  if (url.pathname.startsWith('/embed/')) return url.pathname.length > '/embed/'.length;
  return false;
}

function isTikTokUrl(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host !== 'tiktok.com' && host !== 'm.tiktok.com') return false;
  return url.pathname.length > 1;
}

export function isAllowedVideoUrl(rawUrl: string): boolean {
  const url = safeParseUrl(rawUrl);
  if (!url) return false;
  return isYouTubeUrl(url) || isTikTokUrl(url);
}
