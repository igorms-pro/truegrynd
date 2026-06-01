import type { Faction, ScoreType } from '@/lib/types/database.types';

type Options = {
  width: number;
  height: number;
  faction: Faction;
  username: string;
  challengeTitle: string;
  scoreType: ScoreType;
  scoreValue: number;
  topPercent: number | null;
  rankTextOverride?: string;
  rankSubOverride?: string;
};

function factionColor(faction: Faction): string {
  if (faction === 'nomads') return '#4a9e6f';
  if (faction === 'horde') return '#c0392b';
  return '#7f8c8d';
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  family: string,
  startSize: number,
  minSize = 18,
): number {
  let size = startSize;
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let trimmed = text;
  while (trimmed.length > 0 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed.length > 0 ? `${trimmed}…` : '…';
}

export function drawFinisherCard(canvas: HTMLCanvasElement, options: Options): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = options.width;
  canvas.height = options.height;

  const bg = '#0a0a0f';
  const card = '#111118';
  const border = '#2a2a3a';
  const fg = '#f9fafb';
  const muted = '#9ca3af';
  const accent = factionColor(options.faction);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = Math.floor(canvas.width * 0.06);
  const innerX = pad;
  const innerY = pad;
  const innerW = canvas.width - pad * 2;
  const innerH = canvas.height - pad * 2;
  const textX = innerX + Math.floor(innerW * 0.08);
  const maxTextW = innerW * 0.84;
  const lineY = (pct: number) => innerY + Math.floor(innerH * pct);

  ctx.fillStyle = card;
  ctx.fillRect(innerX, innerY, innerW, innerH);

  ctx.strokeStyle = border;
  ctx.lineWidth = Math.max(2, Math.floor(canvas.width * 0.011));
  ctx.strokeRect(innerX, innerY, innerW, innerH);

  ctx.fillStyle = accent;
  ctx.fillRect(innerX, innerY, Math.max(4, Math.floor(innerW * 0.02)), innerH);

  ctx.textBaseline = 'top';

  const brandSize = fitFontSize(
    ctx,
    'TRUEGRYND',
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * 0.15),
  );
  ctx.fillStyle = fg;
  ctx.font = `900 ${brandSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText('TRUEGRYND', textX, lineY(0.04));

  const titleSize = fitFontSize(
    ctx,
    options.challengeTitle.toUpperCase(),
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * 0.062),
    14,
  );
  ctx.fillStyle = muted;
  ctx.font = `900 ${titleSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const title = truncateToWidth(ctx, options.challengeTitle.toUpperCase(), maxTextW);
  ctx.fillText(title, textX, lineY(0.13));

  const scoreText =
    options.scoreType === 'time' ? formatSeconds(options.scoreValue) : String(options.scoreValue);
  const scoreSize = fitFontSize(
    ctx,
    scoreText,
    maxTextW,
    900,
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    Math.floor(innerW * 0.44),
  );
  ctx.fillStyle = fg;
  ctx.font = `900 ${scoreSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.fillText(scoreText, textX, lineY(0.26));

  const labelSize = Math.floor(innerW * 0.072);
  ctx.fillStyle = muted;
  ctx.font = `900 ${labelSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const label = options.scoreType === 'time' ? 'TIME (MM:SS)' : 'REPS';
  ctx.fillText(label, textX, lineY(0.52));

  const rankText =
    options.rankTextOverride ?? (options.topPercent ? `TOP ${options.topPercent}%` : 'SAVED');
  const rankSize = fitFontSize(
    ctx,
    rankText,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * 0.2),
  );
  ctx.fillStyle = fg;
  ctx.font = `900 ${rankSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(rankText, textX, lineY(0.58));

  const rankSub =
    options.rankSubOverride ??
    (options.topPercent ? 'WORLDWIDE (VALIDATED)' : 'NOT RANKED (NO VIDEO)');
  const rankSubSize = fitFontSize(
    ctx,
    rankSub,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * 0.058),
    12,
  );
  ctx.fillStyle = muted;
  ctx.font = `900 ${rankSubSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const rankSubLine = truncateToWidth(ctx, rankSub, maxTextW);
  ctx.fillText(rankSubLine, textX, lineY(0.68));

  const usernameSize = Math.floor(innerW * 0.072);
  ctx.fillStyle = accent;
  ctx.font = `900 ${usernameSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, options.username.toUpperCase(), maxTextW), textX, lineY(0.78));

  const factionLabel = options.faction.replace('_', ' ').toUpperCase();
  const factionSize = Math.floor(innerW * 0.058);
  ctx.fillStyle = muted;
  ctx.font = `900 ${factionSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, factionLabel, maxTextW), textX, lineY(0.85));
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
