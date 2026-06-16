import type {
  AppState,
  CalculationResult,
  MonitorInfo,
  PetRuntimeState,
  ProviderConfig,
} from '../types';
import { APP_NAME, APP_VERSION } from './appInfo';
import { formatAdaptiveCurrency, formatPercent, formatTokens } from './formatting';
import { runtimeStateLabel } from './runtime';

export interface DiagnosticsInput {
  state: AppState;
  result: CalculationResult;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  userAgent?: string;
}

export const buildDiagnosticsText = ({
  state,
  result,
  runtimeState,
  monitorInfo,
  providerConfig,
  userAgent = 'unknown',
}: DiagnosticsInput): string => {
  const latestEvent = state.monitoring.events[0];

  return [
    `${APP_NAME} diagnostics`,
    `Version: ${APP_VERSION}`,
    `Runtime state: ${runtimeStateLabel[runtimeState]}`,
    `Theme: ${state.theme}`,
    `Pet skin: ${state.petSkin}`,
    `Pet scale: ${Math.round(state.petScale * 100)}%`,
    `Demo mode: ${state.demoMode}`,
    `Collector status: ${monitorInfo.status}`,
    `Usage URL: ${monitorInfo.usageUrl || 'unavailable'}`,
    `Health URL: ${monitorInfo.healthUrl || 'unavailable'}`,
    `Preferred port: ${monitorInfo.preferredPort}`,
    `Actual port: ${monitorInfo.port ?? 'unavailable'}`,
    `Provider: ${providerConfig.providerId}`,
    `Provider enabled: ${providerConfig.enabled ? 'yes' : 'no'}`,
    `Provider Base URL: ${providerConfig.upstreamBaseUrl || 'not set'}`,
    `Provider model: ${providerConfig.model || 'not set'}`,
    'API key: [redacted]',
    `Input price / 1M: ${state.pricing.inputPricePerMillion}`,
    `Output price / 1M: ${state.pricing.outputPricePerMillion}`,
    `Cached input price / 1M: ${state.pricing.cachedInputPricePerMillion}`,
    `Reasoning price / 1M: ${state.pricing.reasoningPricePerMillion}`,
    `Usage events: ${formatTokens(state.monitoring.events.length)}`,
    `Total burned: ${formatAdaptiveCurrency(result.totalCost)}`,
    `Destroyed bills: ${formatTokens(result.destroyedBills)}`,
    `Current bill progress: ${formatPercent(result.currentBillProgress)}`,
    latestEvent
      ? `Latest event: ${new Date(latestEvent.timestamp).toISOString()} · ${latestEvent.source} · ${latestEvent.scenarioName}`
      : 'Latest event: none',
    `Codex monitor: ${monitorInfo.codexMonitor?.status ?? 'unknown'}`,
    `User agent: ${userAgent}`,
    '',
    'Privacy note: this diagnostic text intentionally excludes prompt text, completion text, messages, API keys, and Authorization headers.',
  ].join('\n');
};
