export interface UsageEvent {
  id: string;
  timestamp: number;
  source: string;
  scenarioName: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  directCost: number;
}

interface NormalizeOptions {
  now?: () => number;
  idFactory?: () => string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const numberFrom = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, value);
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(/,/g, '').trim());
      if (Number.isFinite(parsed)) {
        return Math.max(0, parsed);
      }
    }
  }

  return 0;
};

const stringFrom = (fallback: string, ...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
};

export const normalizeUsagePayload = (
  payload: unknown,
  options: NormalizeOptions = {},
): UsageEvent | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const usage = isRecord(payload.usage) ? payload.usage : {};
  const promptDetails = isRecord(usage.prompt_tokens_details)
    ? usage.prompt_tokens_details
    : isRecord(usage.input_tokens_details)
      ? usage.input_tokens_details
      : {};
  const completionDetails = isRecord(usage.completion_tokens_details)
    ? usage.completion_tokens_details
    : isRecord(usage.output_tokens_details)
      ? usage.output_tokens_details
      : {};

  const hasExplicitInputTokens =
    typeof payload.inputTokens !== 'undefined' ||
    typeof payload.input_tokens !== 'undefined' ||
    typeof payload.promptTokens !== 'undefined';
  const rawInputTokens = numberFrom(
    payload.inputTokens,
    payload.input_tokens,
    payload.promptTokens,
    usage.input_tokens,
    usage.prompt_tokens,
  );
  const outputTokens = numberFrom(
    payload.outputTokens,
    payload.output_tokens,
    payload.completionTokens,
    usage.output_tokens,
    usage.completion_tokens,
  );
  const cachedInputTokens = numberFrom(
    payload.cachedInputTokens,
    payload.cached_input_tokens,
    payload.cachedTokens,
    promptDetails.cached_tokens,
    promptDetails.cached_input_tokens,
  );
  const inputTokens =
    !hasExplicitInputTokens && cachedInputTokens > 0
      ? Math.max(0, rawInputTokens - cachedInputTokens)
      : rawInputTokens;
  const reasoningTokens = numberFrom(
    payload.reasoningTokens,
    payload.reasoning_tokens,
    completionDetails.reasoning_tokens,
  );
  const directCost = numberFrom(payload.directCost, payload.direct_cost, payload.totalCost, payload.cost);

  if (inputTokens + outputTokens + cachedInputTokens + reasoningTokens + directCost <= 0) {
    return null;
  }

  const timestamp = options.now?.() ?? Date.now();
  const id = options.idFactory?.() ?? `${timestamp}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    timestamp,
    source: stringFrom('local-usage', payload.source, payload.provider, payload.model),
    scenarioName: stringFrom('实时 token 调用', payload.scenarioName, payload.scenario_name, payload.name),
    inputTokens,
    outputTokens,
    cachedInputTokens,
    reasoningTokens,
    directCost,
  };
};
