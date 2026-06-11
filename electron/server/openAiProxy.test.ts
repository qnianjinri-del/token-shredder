import { describe, expect, it } from 'vitest';
import {
  buildUpstreamUrl,
  extractAssistantText,
  extractUsageEventFromUpstreamResponse,
  normalizeProviderProxyConfig,
  shouldUseConfiguredApiKey,
} from './openAiProxy';

describe('openAiProxy helpers', () => {
  it('normalizes provider config and requires essential fields', () => {
    expect(normalizeProviderProxyConfig({ enabled: true })).toMatchObject({
      enabled: false,
    });

    expect(
      normalizeProviderProxyConfig({
        enabled: true,
        providerId: 'volcengine-ark',
        upstreamBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3/',
        apiKey: 'abc',
        model: 'doubao-test',
      }),
    ).toMatchObject({
      enabled: true,
      upstreamBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
      apiKey: 'abc',
      model: 'doubao-test',
    });
  });

  it('builds upstream urls from local v1 paths', () => {
    expect(
      buildUpstreamUrl('https://ark.cn-beijing.volces.com/api/v3/', '/v1/chat/completions'),
    ).toBe('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
  });

  it('uses configured api key for local placeholder auth', () => {
    expect(shouldUseConfiguredApiKey(undefined)).toBe(true);
    expect(shouldUseConfiguredApiKey('Bearer token-shredder-local')).toBe(true);
    expect(shouldUseConfiguredApiKey('Bearer real-client-key')).toBe(false);
  });

  it('extracts usage from upstream json without double-counting cached tokens', () => {
    const event = extractUsageEventFromUpstreamResponse(
      {
        model: 'doubao-test',
        usage: {
          prompt_tokens: 120_000,
          completion_tokens: 45_000,
          prompt_tokens_details: {
            cached_tokens: 30_000,
          },
        },
      },
      { model: 'fallback-model' },
      'local-proxy',
    );

    expect(event).toMatchObject({
      source: 'local-proxy',
      scenarioName: 'doubao-test',
      inputTokens: 90_000,
      cachedInputTokens: 30_000,
      outputTokens: 45_000,
    });
  });

  it('extracts assistant text from chat completions', () => {
    expect(
      extractAssistantText({
        choices: [{ message: { content: 'connected' } }],
      }),
    ).toBe('connected');
  });
});
