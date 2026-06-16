import type { AppState, ProviderConfig } from '../types';
import { APP_NAME, APP_VERSION } from './appInfo';
import { DEFAULT_PROVIDER_CONFIG, mergeProviderConfig } from './providerConfig';
import { DEFAULT_STATE } from './presets';
import { mergeState } from './storage';

export interface BackupPayload {
  app: typeof APP_NAME;
  version: string;
  exportedAt: string;
  state: AppState;
  providerConfig: ProviderConfig;
  notes: string[];
}

export interface RestoreResult {
  state: AppState;
  providerConfig: ProviderConfig;
  warnings: string[];
}

const stripRuntimeSession = (state: AppState): AppState => ({
  ...state,
  monitoring: {
    events: [],
    directCostTotal: 0,
  },
  usage: {
    ...state.usage,
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    reasoningTokens: 0,
  },
  directCost: 0,
});

const stripProviderSecrets = (providerConfig: ProviderConfig): ProviderConfig => ({
  ...providerConfig,
  enabled: false,
  apiKey: '',
  saveApiKey: false,
});

export const createBackupPayload = (
  state: AppState,
  providerConfig: ProviderConfig,
  exportedAt = new Date().toISOString(),
): BackupPayload => ({
  app: APP_NAME,
  version: APP_VERSION,
  exportedAt,
  state: stripRuntimeSession(state),
  providerConfig: stripProviderSecrets(providerConfig),
  notes: [
    'This backup intentionally excludes API keys, prompt text, completion text, messages, and session usage logs.',
    'Prices are editable sample values and are not official live provider prices.',
  ],
});

export const stringifyBackupPayload = (payload: BackupPayload): string =>
  JSON.stringify(payload, null, 2);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const restoreBackupJson = (raw: string): RestoreResult => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('JSON 格式不正确。');
  }

  if (!isRecord(parsed)) {
    throw new Error('备份文件必须是 JSON object。');
  }

  const warnings: string[] = [];

  if (parsed.app !== APP_NAME) {
    warnings.push('备份 app 名称不是 Token Shredder，已尝试兼容导入。');
  }

  const state = mergeState(
    isRecord(parsed.state) ? (parsed.state as Partial<AppState>) : {},
    DEFAULT_STATE,
  );
  const providerConfig = mergeProviderConfig(
    isRecord(parsed.providerConfig) ? parsed.providerConfig : {},
    DEFAULT_PROVIDER_CONFIG,
  );

  return {
    state: stripRuntimeSession(state),
    providerConfig: stripProviderSecrets(providerConfig),
    warnings,
  };
};
