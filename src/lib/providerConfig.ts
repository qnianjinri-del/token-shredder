import type { ProviderConfig, ProviderId } from '../types';
import { providerIds } from './providerTemplates';

const PROVIDER_CONFIG_KEY = 'token-shredder:provider-config:v1';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stringFrom = (value: unknown, fallback = '') =>
  typeof value === 'string' && value.trim() ? value.trim() : fallback;

const providerIdFrom = (value: unknown): ProviderId => {
  if (typeof value === 'string' && providerIds.includes(value as ProviderId)) {
    return value as ProviderId;
  }

  return 'volcengine-ark';
};

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  enabled: false,
  providerId: 'volcengine-ark',
  upstreamBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: '',
  model: '',
  saveApiKey: false,
  testPrompt: '用一句话回复：Token Shredder 已连接。',
};

export const mergeProviderConfig = (
  candidate: unknown,
  fallback: ProviderConfig = DEFAULT_PROVIDER_CONFIG,
): ProviderConfig => {
  if (!isRecord(candidate)) {
    return fallback;
  }

  const saveApiKey = Boolean(candidate.saveApiKey);

  return {
    ...fallback,
    enabled: Boolean(candidate.enabled),
    providerId: providerIdFrom(candidate.providerId),
    upstreamBaseUrl: stringFrom(candidate.upstreamBaseUrl, fallback.upstreamBaseUrl),
    apiKey: saveApiKey ? stringFrom(candidate.apiKey) : '',
    model: stringFrom(candidate.model, fallback.model),
    saveApiKey,
    testPrompt: stringFrom(candidate.testPrompt, fallback.testPrompt),
  };
};

export const loadProviderConfig = (): ProviderConfig => {
  try {
    const raw = window.localStorage.getItem(PROVIDER_CONFIG_KEY);
    if (!raw) {
      return DEFAULT_PROVIDER_CONFIG;
    }

    return mergeProviderConfig(JSON.parse(raw) as unknown);
  } catch {
    return DEFAULT_PROVIDER_CONFIG;
  }
};

export const saveProviderConfig = (config: ProviderConfig): void => {
  try {
    window.localStorage.setItem(
      PROVIDER_CONFIG_KEY,
      JSON.stringify({
        ...config,
        apiKey: config.saveApiKey ? config.apiKey : '',
      }),
    );
  } catch {
    // The app still works without persistence.
  }
};

export const clearProviderConfig = (): void => {
  try {
    window.localStorage.removeItem(PROVIDER_CONFIG_KEY);
  } catch {
    // No-op.
  }
};
