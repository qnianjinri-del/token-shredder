import { describe, expect, it } from 'vitest';
import type { AppState, MonitorInfo, ProviderConfig } from '../types';
import { DEFAULT_PROVIDER_CONFIG } from './providerConfig';
import { DEFAULT_STATE } from './presets';
import { createQuickStartUsageEvent } from './quickStart';
import { deriveSetupReadiness, providerMissingFields } from './setupReadiness';

const runningMonitor: MonitorInfo = {
  host: '127.0.0.1',
  port: 17391,
  preferredPort: 17391,
  preferredPortAvailable: true,
  usageUrl: 'http://127.0.0.1:17391/usage',
  healthUrl: 'http://127.0.0.1:17391/health',
  status: 'running',
  receivedUsageEvents: 0,
};

const stoppedMonitor: MonitorInfo = {
  ...runningMonitor,
  port: null,
  usageUrl: '',
  healthUrl: '',
  status: 'error',
  error: 'port unavailable',
};

const readyProvider: ProviderConfig = {
  ...DEFAULT_PROVIDER_CONFIG,
  enabled: true,
  apiKey: 'secret',
  upstreamBaseUrl: 'https://example.com/v1',
  model: 'demo-model',
};

const withEvents = (state: AppState, events: AppState['monitoring']['events']): AppState => ({
  ...state,
  monitoring: {
    ...state.monitoring,
    events,
  },
});

describe('deriveSetupReadiness', () => {
  it('reports unavailable collector before asking the user to connect anything', () => {
    const readiness = deriveSetupReadiness({
      state: DEFAULT_STATE,
      runtimeState: 'empty',
      monitorInfo: stoppedMonitor,
      providerConfig: DEFAULT_PROVIDER_CONFIG,
    });

    expect(readiness.status).toBe('collector-unavailable');
    expect(readiness.primaryHref).toBe('#diagnostics');
  });

  it('starts a fresh user with the no-key demo action', () => {
    const readiness = deriveSetupReadiness({
      state: DEFAULT_STATE,
      runtimeState: 'empty',
      monitorInfo: runningMonitor,
      providerConfig: DEFAULT_PROVIDER_CONFIG,
    });

    expect(readiness.status).toBe('try-demo');
    expect(readiness.primaryAction).toBe('quick-demo');
  });

  it('treats quick-start usage as demo usage, not real monitoring', () => {
    const readiness = deriveSetupReadiness({
      state: withEvents(DEFAULT_STATE, [createQuickStartUsageEvent(123)]),
      runtimeState: 'idle-real',
      monitorInfo: runningMonitor,
      providerConfig: DEFAULT_PROVIDER_CONFIG,
    });

    expect(readiness.status).toBe('choose-integration');
    expect(readiness.hasAnyUsage).toBe(true);
    expect(readiness.hasRealUsage).toBe(false);
    expect(readiness.primaryAction).toBe('collector-test');
  });

  it('offers provider testing when provider fields are ready, even before enabling proxy', () => {
    const readiness = deriveSetupReadiness({
      state: DEFAULT_STATE,
      runtimeState: 'empty',
      monitorInfo: runningMonitor,
      providerConfig: { ...readyProvider, enabled: false },
    });

    expect(readiness.status).toBe('proxy-ready');
    expect(readiness.primaryAction).toBe('provider-test');
    expect(readiness.primaryLabel).toBe('保存并测试代理');
  });

  it('detects real usage after a non-demo event arrives', () => {
    const realUsage = {
      ...createQuickStartUsageEvent(456),
      id: 'real-usage',
      source: 'local-proxy',
      scenarioName: 'demo-model',
    };
    const readiness = deriveSetupReadiness({
      state: withEvents(DEFAULT_STATE, [realUsage]),
      runtimeState: 'idle-real',
      monitorInfo: runningMonitor,
      providerConfig: readyProvider,
    });

    expect(readiness.status).toBe('real-monitoring');
    expect(readiness.hasRealUsage).toBe(true);
  });
});

describe('providerMissingFields', () => {
  it('lists only missing required provider fields', () => {
    expect(providerMissingFields(DEFAULT_PROVIDER_CONFIG)).toEqual(['API Key', '模型 / 接入点 ID']);
    expect(providerMissingFields(readyProvider)).toEqual([]);
  });
});
