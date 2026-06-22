/* global console, fetch, process */

import { fileURLToPath } from 'node:url';

const DEFAULT_ENDPOINT = process.env.TOKEN_SHREDDER_URL || 'http://127.0.0.1:17391/usage';

const numberFrom = (...values) => {
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

export const eventFromOpenAIUsage = ({
  source = 'node-agent',
  scenarioName = 'AI call',
  usage,
  directCost = 0,
} = {}) => {
  const promptDetails = usage?.prompt_tokens_details ?? usage?.input_tokens_details ?? {};
  const completionDetails = usage?.completion_tokens_details ?? usage?.output_tokens_details ?? {};
  const promptTokens = numberFrom(usage?.prompt_tokens, usage?.input_tokens);
  const cachedInputTokens = numberFrom(
    promptDetails.cached_tokens,
    promptDetails.cached_input_tokens,
  );

  return {
    source,
    scenarioName,
    inputTokens: Math.max(0, promptTokens - cachedInputTokens),
    outputTokens: numberFrom(usage?.completion_tokens, usage?.output_tokens),
    cachedInputTokens,
    reasoningTokens: numberFrom(completionDetails.reasoning_tokens),
    directCost: numberFrom(directCost),
  };
};

export const reportUsage = async (event, endpoint = DEFAULT_ENDPOINT) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Token Shredder rejected usage: ${response.status} ${body}`);
  }

  return body ? JSON.parse(body) : null;
};

export const reportOpenAIUsage = async (response, options = {}) => {
  const event = eventFromOpenAIUsage({
    source: options.source,
    scenarioName: options.scenarioName,
    usage: response?.usage,
    directCost: options.directCost,
  });
  const total =
    event.inputTokens +
    event.outputTokens +
    event.cachedInputTokens +
    event.reasoningTokens +
    event.directCost;

  if (total <= 0) {
    return null;
  }

  return reportUsage(event, options.endpoint);
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const demoResponse = {
    usage: {
      prompt_tokens: 180_000,
      completion_tokens: 64_000,
      prompt_tokens_details: { cached_tokens: 40_000 },
      completion_tokens_details: { reasoning_tokens: 9_000 },
    },
  };

  const result = await reportOpenAIUsage(demoResponse, {
    source: 'node-reporter-helper',
    scenarioName: 'Reporter helper demo',
  });
  console.log(`Reported usage to ${DEFAULT_ENDPOINT}`);
  console.log(result);
}
