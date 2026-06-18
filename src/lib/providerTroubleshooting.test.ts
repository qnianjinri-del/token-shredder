import { describe, expect, it } from 'vitest';
import type { ProviderConfig, ProviderTestResult } from '../types';
import { DEFAULT_PROVIDER_CONFIG } from './providerConfig';
import { createProviderTroubleshooting } from './providerTroubleshooting';

const readyConfig: ProviderConfig = {
  ...DEFAULT_PROVIDER_CONFIG,
  enabled: true,
  apiKey: 'secret-key',
  upstreamBaseUrl: 'https://example.com/v1',
  model: 'demo-model',
};

const troubleshoot = (result: ProviderTestResult | null, config = readyConfig) =>
  createProviderTroubleshooting({
    result,
    providerConfig: config,
    proxyBaseUrl: 'http://127.0.0.1:17391/v1',
  });

describe('provider troubleshooting', () => {
  it('asks for missing provider fields before classifying upstream errors', () => {
    const item = troubleshoot({ ok: false, status: 401, error: 'Unauthorized' }, DEFAULT_PROVIDER_CONFIG);

    expect(item.kind).toBe('missing-fields');
    expect(item.title).toContain('补齐');
  });

  it('detects auth and permission errors', () => {
    const item = troubleshoot({ ok: false, status: 403, error: 'Forbidden API key' });

    expect(item.kind).toBe('auth');
    expect(item.steps.join('\n')).toContain('API Key');
  });

  it('detects model or endpoint problems', () => {
    const item = troubleshoot({ ok: false, status: 404, error: 'model not found' });

    expect(item.kind).toBe('model-or-path');
    expect(item.summary).toContain('模型');
  });

  it('detects rate limits and quota errors', () => {
    const item = troubleshoot({ ok: false, status: 429, error: 'rate limit exceeded' });

    expect(item.kind).toBe('rate-limit');
    expect(item.steps.join('\n')).toContain('quota');
  });

  it('warns when the provider responds without usage', () => {
    const item = troubleshoot({ ok: true, status: 200, content: 'hello', usageEvent: null });

    expect(item.kind).toBe('success-without-usage');
    expect(item.tone).toBe('warn');
  });

  it('recognizes the ideal successful state', () => {
    const item = troubleshoot({
      ok: true,
      status: 200,
      usageEvent: {
        id: 'usage-1',
        timestamp: 1,
        source: 'local-proxy',
        scenarioName: 'demo',
        inputTokens: 1,
        outputTokens: 2,
        cachedInputTokens: 0,
        reasoningTokens: 0,
        directCost: 0,
      },
    });

    expect(item.kind).toBe('success-with-usage');
    expect(item.tone).toBe('ok');
  });

  it('builds a copyable report without API keys or prompt contents', () => {
    const item = troubleshoot({ ok: false, status: 401, error: 'Unauthorized' });

    expect(item.report).toContain('Token Shredder provider troubleshooting report');
    expect(item.report).toContain('demo-model');
    expect(item.report).not.toContain('secret-key');
    expect(item.report).toContain('Privacy note');
  });
});
