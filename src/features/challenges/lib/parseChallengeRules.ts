export type ParsedChallengeRules = {
  scoring: string;
  circuitLines: string[];
  standards: string;
};

const CIRCUIT_HEADER = 'CIRCUIT';
const MOVEMENT_LINE_RE = /^\d+\.\s/;

function splitScoringAndBody(text: string): { scoring: string; body: string } {
  const parts = text.split(/\n\n+/);
  if (parts.length > 1 && parts[0].includes('SCORING')) {
    return { scoring: parts[0].trim(), body: parts.slice(1).join('\n\n').trim() };
  }
  if (text.includes('SCORING') && text.includes(CIRCUIT_HEADER)) {
    const idx = text.indexOf(`\n${CIRCUIT_HEADER}\n`);
    if (idx >= 0) {
      return { scoring: text.slice(0, idx).trim(), body: text.slice(idx + 1).trim() };
    }
  }
  if (text.includes('SCORING') && !text.includes(CIRCUIT_HEADER)) {
    return { scoring: text.trim(), body: '' };
  }
  return { scoring: '', body: text };
}

function parseBodyLines(body: string): { circuitLines: string[]; standards: string } {
  let content = body.trim();
  if (content.startsWith(CIRCUIT_HEADER)) {
    content = content.slice(CIRCUIT_HEADER.length).trim();
  }

  const circuitLines: string[] = [];
  const standardsLines: string[] = [];

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (MOVEMENT_LINE_RE.test(trimmed)) {
      circuitLines.push(trimmed);
      continue;
    }
    standardsLines.push(line);
  }

  return { circuitLines, standards: standardsLines.join('\n').trim() };
}

export function parseChallengeRules(rules: string): ParsedChallengeRules {
  const text = rules.trim();
  if (text.length === 0) {
    return { scoring: '', circuitLines: [], standards: '' };
  }

  const { scoring, body } = splitScoringAndBody(text);
  const { circuitLines, standards } = parseBodyLines(body);

  if (scoring.length === 0 && circuitLines.length === 0 && standards.length === 0) {
    if (text.includes('SCORING')) {
      return { scoring: text, circuitLines: [], standards: '' };
    }
    return { scoring: '', circuitLines: [], standards: text };
  }

  return { scoring, circuitLines, standards };
}
