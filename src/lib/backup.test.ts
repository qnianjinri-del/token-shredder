import { describe, expect, it } from 'vitest';
import type { AppState, ProviderConfig } from '../types';
import { DEFAULT_STATE } from './presets';
import { createBackupPayload, restoreBackupJson, stringifyBackupPayload } from './backup';

const providerConfig: ProviderConfig = {
  enabled: true,
  providerId: 'volcengine-ark',
  upstreamBaseUrl: 'https://example.com/v1',
  apiKey: 'secret-key',
  model: 'demo-model',
  saveApiKey: true,
  testPrompt: 'hello',
};

describe('backup helpers', () => {
  it('exports configuration without secrets or session usage', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      usage: {
        ...DEFAULT_STATE.usage,
        inputTokens: 123,
      },
      monitoring: {
        directCostTotal: 9,
        events: [
          {
            id: 'event-1',
            timestamp: 1,
            source: 'test',
            scenarioName: 'secret session',
            inputTokens: 1,
            outputTokens: 1,
            cachedInputTokens: 0,
            reasoningTokens: 0,
            directCost: 0,
          },
        ],
      },
    };

    const payload = createBackupPayload(state, providerConfig, '2026-01-01T00:00:00.000Z');

    expect(payload.providerConfig.apiKey).toBe('');
    expect(payload.providerConfig.enabled).toBe(false);
    expect(payload.providerConfig.saveApiKey).toBe(false);
    expect(payload.state.monitoring.events).toHaveLength(0);
    expect(payload.state.usage.inputTokens).toBe(0);
    expect(stringifyBackupPayload(payload)).toContain('Token Shredder');
  });

  it('restores safe config and strips imported secrets', () => {
    const raw = stringifyBackupPayload(createBackupPayload(DEFAULT_STATE, providerConfig));
    const result = restoreBackupJson(
      raw.replace('"apiKey": ""', '"apiKey": "should-not-survive"').replace('"saveApiKey": false', '"saveApiKey": true'),
    );

    expect(result.providerConfig.apiKey).toBe('');
    expect(result.providerConfig.saveApiKey).toBe(false);
    expect(result.state.monitoring.events).toHaveLength(0);
  });

  it('throws a useful error for invalid JSON', () => {
    expect(() => restoreBackupJson('{bad json')).toThrow('JSON 格式不正确');
  });
});
