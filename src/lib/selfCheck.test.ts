import { describe, expect, it } from 'vitest';
import type { MonitorInfo, ProviderConfig } from '../types';
import { DEFAULT_PROVIDER_CONFIG } from './providerConfig';
import { DEFAULT_STATE } from './presets';
import {
  buildSelfCheckReport,
  createStaticSelfCheckItems,
  summarizeSelfCheckStatus,
  type SelfCheckItem,
} from './selfCheck';

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

const readyProvider: ProviderConfig = {
  ...DEFAULT_PROVIDER_CONFIG,
  enabled: true,
  apiKey: 'secret-key',
  upstreamBaseUrl: 'https://example.com/v1',
  model: 'demo-model',
};

describe('self check helpers', () => {
  it('summarizes the worst item status', () => {
    const items: SelfCheckItem[] = [
      { id: 'a', label: 'a', status: 'pass', detail: 'ok' },
      { id: 'b', label: 'b', status: 'warn', detail: 'watch' },
    ];

    expect(summarizeSelfCheckStatus(items)).toBe('warn');
    expect(summarizeSelfCheckStatus([...items, { id: 'c', label: 'c', status: 'fail', detail: 'bad' }])).toBe('fail');
  });

  it('creates static checks from app state', () => {
    const items = createStaticSelfCheckItems({
      state: DEFAULT_STATE,
      runtimeState: 'empty',
      monitorInfo: runningMonitor,
      providerConfig: readyProvider,
    });

    expect(items.some((item) => item.id === 'collector-state' && item.status === 'pass')).toBe(true);
    expect(items.some((item) => item.id === 'provider-fields' && item.status === 'pass')).toBe(true);
    expect(items.some((item) => item.id === 'real-usage' && item.status === 'warn')).toBe(true);
  });

  it('builds a copyable report without secrets', () => {
    const input = {
      state: DEFAULT_STATE,
      runtimeState: 'empty' as const,
      monitorInfo: runningMonitor,
      providerConfig: readyProvider,
    };
    const text = buildSelfCheckReport({
      input,
      items: createStaticSelfCheckItems(input),
      generatedAt: new Date('2026-06-17T00:00:00Z'),
    });

    expect(text).toContain('Token Shredder 自动体检报告');
    expect(text).toContain('Generated: 2026-06-17T00:00:00.000Z');
    expect(text).toContain('Provider missing fields: none');
    expect(text).toContain('Privacy note');
    expect(text).not.toContain('secret-key');
  });
});
