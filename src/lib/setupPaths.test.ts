import { describe, expect, it } from 'vitest';
import type { AppState, MonitorInfo, ProviderConfig } from '../types';
import { DEFAULT_PROVIDER_CONFIG } from './providerConfig';
import { DEFAULT_STATE } from './presets';
import { createQuickStartUsageEvent } from './quickStart';
import { buildSetupPaths, suggestSetupPathId } from './setupPaths';

const runningMonitor: MonitorInfo = {
  host: '127.0.0.1',
  port: 17391,
  preferredPort: 17391,
  preferredPortAvailable: true,
  usageUrl: 'http://127.0.0.1:17391/usage',
  healthUrl: 'http://127.0.0.1:17391/health',
  status: 'running',
  receivedUsageEvents: 0,
  codexMonitor: {
    enabled: true,
    status: 'watching',
    sessionsPath: '/Users/me/.codex/sessions',
  },
};

const readyProvider: ProviderConfig = {
  ...DEFAULT_PROVIDER_CONFIG,
  enabled: true,
  apiKey: 'secret',
  upstreamBaseUrl: 'https://example.com/v1',
  model: 'demo-model',
};

const stateWithEvents = (events: AppState['monitoring']['events']): AppState => ({
  ...DEFAULT_STATE,
  monitoring: {
    ...DEFAULT_STATE.monitoring,
    events,
  },
});

describe('setup paths', () => {
  it('keeps the quick demo path no-key and beginner-safe', () => {
    const quickDemo = buildSetupPaths({
      state: DEFAULT_STATE,
      monitorInfo: runningMonitor,
      providerConfig: DEFAULT_PROVIDER_CONFIG,
    }).find((path) => path.id === 'quick-demo');

    expect(quickDemo?.badge).toContain('无需 API Key');
    expect(quickDemo?.requiredInfo.some((item) => item.label === 'API Key' && item.done)).toBe(true);
    expect(quickDemo?.privacyNote).toContain('不会上传数据');
  });

  it('lists provider proxy required fields without leaking the key', () => {
    const providerPath = buildSetupPaths({
      state: DEFAULT_STATE,
      monitorInfo: runningMonitor,
      providerConfig: readyProvider,
    }).find((path) => path.id === 'provider-proxy');

    expect(providerPath?.summary).toContain('http://127.0.0.1:17391/v1');
    expect(providerPath?.requiredInfo.map((item) => item.label)).toEqual([
      'API Key',
      '上游 Base URL',
      '模型 / 接入点 ID',
      '价格',
    ]);
    expect(JSON.stringify(providerPath)).not.toContain('secret');
  });

  it('does not require API keys for direct usage reporting', () => {
    const directPath = buildSetupPaths({
      state: DEFAULT_STATE,
      monitorInfo: runningMonitor,
      providerConfig: DEFAULT_PROVIDER_CONFIG,
    }).find((path) => path.id === 'direct-usage');

    expect(directPath?.summary).toContain('http://127.0.0.1:17391/usage');
    expect(directPath?.requiredInfo.some((item) => item.label === 'API Key' && item.done)).toBe(true);
    expect(directPath?.privacyNote).toContain('不要发送 prompt');
  });

  it('suggests provider path when provider fields are complete', () => {
    expect(
      suggestSetupPathId({
        state: DEFAULT_STATE,
        monitorInfo: runningMonitor,
        providerConfig: readyProvider,
      }),
    ).toBe('provider-proxy');
  });

  it('suggests direct usage after real usage has arrived', () => {
    const realUsage = {
      ...createQuickStartUsageEvent(1),
      id: 'real-1',
      source: 'my-agent',
      scenarioName: 'real run',
    };

    expect(
      suggestSetupPathId({
        state: stateWithEvents([realUsage]),
        monitorInfo: runningMonitor,
        providerConfig: DEFAULT_PROVIDER_CONFIG,
      }),
    ).toBe('direct-usage');
  });
});
