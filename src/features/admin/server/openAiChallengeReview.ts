import { parseAiReviewPayload } from '@/features/admin/lib/aiReviewSchema';

const MAX_FIELD_CHARS = 8000;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function buildUserPayload(input: {
  title: string;
  description: string;
  rules: string;
  scoreType: string;
}): string {
  return [
    'Challenge submission for moderation triage.',
    `title: ${truncate(input.title, MAX_FIELD_CHARS)}`,
    `description: ${truncate(input.description, MAX_FIELD_CHARS)}`,
    `rules: ${truncate(input.rules, MAX_FIELD_CHARS)}`,
    `score_type: ${input.scoreType}`,
  ].join('\n');
}

type OpenAiArgs = {
  apiKey: string;
  model: string;
  userPayload: string;
};

export async function callOpenAiChallengeReview(args: OpenAiArgs): Promise<{
  tier: string;
  summary: string;
  model: string;
}> {
  const system =
    'You triage user-submitted fitness challenges for human moderators. ' +
    'Respond with JSON only: {"tier":"green"|"orange"|"red","summary":"..."}. ' +
    'green = clearly legitimate, standard movements, safe wording. ' +
    'orange = ambiguous, thin rules, possible edge cases, or needs human judgment. ' +
    'red = unsafe, spam, hate, sexual content, extreme risk, or non-fitness. ' +
    'summary: max 400 characters, English, no PII, no usernames.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: args.userPayload },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`openai_http_${res.status}:${errText.slice(0, 120)}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const raw = body.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error('openai_empty_content');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error('openai_invalid_json');
  }

  const validated = parseAiReviewPayload(parsed);
  return {
    tier: validated.tier,
    summary: validated.summary,
    model: args.model,
  };
}

export function buildChallengeReviewUserPayload(input: {
  title: string;
  description: string;
  rules: string;
  scoreType: string;
}): string {
  return buildUserPayload(input);
}
