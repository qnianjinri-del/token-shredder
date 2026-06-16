import { describe, expect, it } from 'vitest';
import type { CalculationResult, MonitorInfo, ProviderConfig } from '../types';
import { DEFAULT_STATE } from './presets';
import { buildDiagnosticsText } from './diagnostics';

const result: CalculationResult = {
  inputCost: 0.1,
  outputCost: 0.2,
  cachedCost: 0.03,
  reasoningCost: 0.04,
  costPerRun: 0.37,
  totalCost: 1.25,
  dailyCost: 0,
  monthlyCost: 0,
  destroyedBills: 1,
  currentBillProgress: 0.25,
  currentBillProgressPercent: 25,
  summarySentence: 'test',
};

const monitorInfo: MonitorInfo = {
  host: '127.0.0.1',
  port: 17391,
  preferredPort: 17391,
  preferredPortAvailable: true,
  usageUrl: 'http://127.0.0.1:17391/usage',
  healthUrl: 'http://127.0.0.1:17391/health',
  status: 'running',
  receivedUsageEvents: 0,
};

const providerConfig: ProviderConfig = {
  enabled: true,
  providerId: 'custom',
  upstreamBaseUrl: 'https://example.com/v1',
  apiKey: 'super-secret',
  model: 'demo-model',
  saveApiKey: true,
  testPrompt: 'hello',
};

describe('buildDiagnosticsText', () => {
  it('builds shareable diagnostics without secrets', () => {
    const text = buildDiagnosticsText({
      state: DEFAULT_STATE,
      result,
      runtimeState: 'idle-real',
      monitorInfo,
      providerConfig,
      userAgent: 'vitest',
    });

    expect(text).toContain('Token Shredder diagnostics');
    expect(text).toContain('Version:');
    expect(text).toContain('Usage URL: http://127.0.0.1:17391/usage');
    expect(text).toContain('Provider Base URL: https://example.com/v1');
    expect(text).toContain('API key: [redacted]');
    expect(text).not.toContain('super-secret');
    expect(text).not.toContain('hello');
  });
});
