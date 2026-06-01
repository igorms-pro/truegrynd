import type { FinisherCardDrawOptions } from '@/lib/finisher/buildFinisherCardOptions';
import { getDivisionColor } from '@/lib/divisions';
import type { Faction } from '@/lib/types/database.types';

type Options = FinisherCardDrawOptions;

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

  const titleStartPct = options.weeklyBadge ? 0.1 : 0.13;
  if (options.weeklyBadge) {
    const weeklySize = fitFontSize(
      ctx,
      options.weeklyBadge.toUpperCase(),
      maxTextW,
      900,
      'system-ui, -apple-system, Segoe UI, sans-serif',
      Math.floor(innerW * 0.055),
      12,
    );
    ctx.fillStyle = '#ffb800';
    ctx.font = `900 ${weeklySize}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.fillText(
      truncateToWidth(ctx, options.weeklyBadge.toUpperCase(), maxTextW),
      textX,
      lineY(0.085),
    );
  }

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
  ctx.fillText(title, textX, lineY(titleStartPct));

  const scoreTop = lineY(0.26);
  const labelTop = lineY(0.52);
  const maxScoreHeight = Math.max(24, labelTop - scoreTop - Math.floor(innerH * 0.02));

  const scoreText =
    options.scoreType === 'time' ? formatSeconds(options.scoreValue) : String(options.scoreValue);
  let scoreSize = fitFontSize(
    ctx,
    scoreText,
    maxTextW,
    900,
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    Math.floor(innerW * 0.44),
  );
  scoreSize = Math.min(scoreSize, maxScoreHeight);

  ctx.fillStyle = fg;
  ctx.font = `900 ${scoreSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  ctx.fillText(scoreText, textX, scoreTop);

  const compact = options.height <= 700;
  const labelY = compact ? lineY(0.54) : lineY(0.52);
  const rankY = compact ? lineY(0.6) : lineY(0.58);
  const rankSubY = compact ? lineY(0.66) : lineY(0.68);
  const usernameY = compact ? lineY(0.76) : lineY(0.78);
  const divisionY = compact ? lineY(0.82) : lineY(0.83);
  const factionY = compact ? lineY(0.88) : lineY(0.89);

  const labelSize = Math.floor(innerW * (compact ? 0.06 : 0.072));
  ctx.fillStyle = muted;
  ctx.font = `900 ${labelSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const label = options.scoreType === 'time' ? 'TIME (MM:SS)' : 'REPS';
  ctx.fillText(label, textX, labelY);

  const rankText =
    options.rankTextOverride ?? (options.topPercent ? `TOP ${options.topPercent}%` : 'SAVED');
  const rankSize = fitFontSize(
    ctx,
    rankText,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * (compact ? 0.16 : 0.2)),
  );
  ctx.fillStyle = fg;
  ctx.font = `900 ${rankSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(rankText, textX, rankY);

  const rankSub =
    options.rankSubOverride ??
    (options.topPercent ? 'WORLDWIDE (VALIDATED)' : 'NOT RANKED (NO VIDEO)');
  const rankSubSize = fitFontSize(
    ctx,
    rankSub,
    maxTextW,
    900,
    'system-ui, -apple-system, Segoe UI, sans-serif',
    Math.floor(innerW * (compact ? 0.05 : 0.058)),
    compact ? 10 : 12,
  );
  ctx.fillStyle = muted;
  ctx.font = `900 ${rankSubSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  const rankSubLine = truncateToWidth(ctx, rankSub, maxTextW);
  ctx.fillText(rankSubLine, textX, rankSubY);

  const usernameSize = Math.floor(innerW * (compact ? 0.06 : 0.072));
  ctx.fillStyle = accent;
  ctx.font = `900 ${usernameSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, options.username.toUpperCase(), maxTextW), textX, usernameY);

  const divisionLabel = options.division.toUpperCase();
  const divisionSize = Math.floor(innerW * (compact ? 0.05 : 0.058));
  ctx.fillStyle = getDivisionColor(options.division);
  ctx.font = `900 ${divisionSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, divisionLabel, maxTextW), textX, divisionY);

  const factionLabel = options.faction.replace('_', ' ').toUpperCase();
  const factionSize = Math.floor(innerW * (compact ? 0.05 : 0.058));
  ctx.fillStyle = muted;
  ctx.font = `900 ${factionSize}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.fillText(truncateToWidth(ctx, factionLabel, maxTextW), textX, factionY);
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}
