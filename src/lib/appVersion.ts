/** Product version shown in Settings footer (decoupled from package.json patch). */
export const APP_DISPLAY_VERSION = '1.5.0';

export function formatAppVersionLabel(env: 'production' | 'development' = 'production'): string {
  const suffix = env === 'production' ? 'Production' : 'Development';
  return `Truegrynd v${APP_DISPLAY_VERSION} — ${suffix}`;
}
