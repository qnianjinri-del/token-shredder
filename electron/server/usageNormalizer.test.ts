import { describe, expect, it } from 'vitest';
import { normalizeUsagePayload } from './usageNormalizer';

const options = {
  now: () => 123,
  idFactory: () => 'event-1',
};

describe('normalizeUsagePayload', () => {
  it('accepts Token Shredder native usage fields', () => {
    const event = normalizeUsagePayload(
      {
        source: 'my-agent',
        scenarioName: 'repo cleanup',
        inputTokens: 120_000,
        outputTokens: 45_000,
        cachedInputTokens: 30_000,
        reasoningTokens: 8_000,
        directCost: 0.12,
      },
      options,
    );

    expect(event).toMatchObject({
      id: 'event-1',
      timestamp: 123,
      source: 'my-agent',
      scenarioName: 'repo cleanup',
      inputTokens: 120_000,
      outputTokens: 45_000,
      cachedInputTokens: 30_000,
      reasoningTokens: 8_000,
      directCost: 0.12,
    });
  });

  it('accepts OpenAI-style usage and subtracts cached tokens from prompt tokens', () => {
    const event = normalizeUsagePayload(
      {
        source: 'openai-compatible-client',
        usage: {
          prompt_tokens: 120_000,
          completion_tokens: 45_000,
          prompt_tokens_details: {
            cached_tokens: 30_000,
          },
          completion_tokens_details: {
            reasoning_tokens: 8_000,
          },
        },
      },
      options,
    );

    expect(event).toMatchObject({
      source: 'openai-compatible-client',
      inputTokens: 90_000,
      outputTokens: 45_000,
      cachedInputTokens: 30_000,
      reasoningTokens: 8_000,
    });
  });

  it('does not subtract cached tokens when inputTokens is explicitly provided', () => {
    const event = normalizeUsagePayload(
      {
        inputTokens: 120_000,
        usage: {
          prompt_tokens_details: {
            cached_tokens: 30_000,
          },
        },
      },
      options,
    );

    expect(event).toMatchObject({
      inputTokens: 120_000,
      cachedInputTokens: 30_000,
    });
  });

  it('clamps negative and invalid numbers to zero', () => {
    const event = normalizeUsagePayload(
      {
        source: 'bad-counters',
        inputTokens: -10,
        outputTokens: '12,500',
        cachedInputTokens: Number.NaN,
        reasoningTokens: 'oops',
      },
      options,
    );

    expect(event).toMatchObject({
      inputTokens: 0,
      outputTokens: 12_500,
      cachedInputTokens: 0,
      reasoningTokens: 0,
    });
  });

  it('returns null for missing or empty usage', () => {
    expect(normalizeUsagePayload({}, options)).toBeNull();
    expect(normalizeUsagePayload(null, options)).toBeNull();
    expect(normalizeUsagePayload({ usage: {} }, options)).toBeNull();
  });
});
