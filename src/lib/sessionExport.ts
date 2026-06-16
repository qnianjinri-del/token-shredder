import type { AppState, CalculationResult, Pricing, UsageEvent } from '../types';
import { APP_NAME, APP_VERSION } from './appInfo';
import { formatAdaptiveCurrency, formatCurrency, formatPercent, formatTokens } from './formatting';
import { calculateUsageEventCost } from './usage';

export interface SessionExportEvent {
  timestamp: string;
  source: string;
  scenarioName: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  directCost: number;
  eventCost: number;
}

export interface SessionExportPayload {
  app: typeof APP_NAME;
  version: string;
  exportedAt: string;
  scenarioName: string;
  pricing: Pricing;
  summary: {
    totalCost: number;
    inputCost: number;
    outputCost: number;
    cachedCost: number;
    reasoningCost: number;
    destroyedBills: number;
    currentBillProgressPercent: number;
    usageEvents: number;
  };
  events: SessionExportEvent[];
  privacy: string;
}

const csvCell = (value: string | number): string => {
  const text = String(value);
  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
};

const eventToExport = (event: UsageEvent, pricing: Pricing): SessionExportEvent => ({
  timestamp: new Date(event.timestamp).toISOString(),
  source: event.source,
  scenarioName: event.scenarioName,
  inputTokens: event.inputTokens,
  outputTokens: event.outputTokens,
  cachedInputTokens: event.cachedInputTokens,
  reasoningTokens: event.reasoningTokens,
  directCost: event.directCost,
  eventCost: calculateUsageEventCost(event, pricing),
});

export const createSessionExportPayload = (
  state: AppState,
  result: CalculationResult,
  exportedAt = new Date().toISOString(),
): SessionExportPayload => ({
  app: APP_NAME,
  version: APP_VERSION,
  exportedAt,
  scenarioName: state.scenarioName || '未命名 session',
  pricing: state.pricing,
  summary: {
    totalCost: result.totalCost,
    inputCost: result.inputCost,
    outputCost: result.outputCost,
    cachedCost: result.cachedCost,
    reasoningCost: result.reasoningCost,
    destroyedBills: result.destroyedBills,
    currentBillProgressPercent: result.currentBillProgressPercent,
    usageEvents: state.monitoring.events.length,
  },
  events: state.monitoring.events
    .slice()
    .reverse()
    .map((event) => eventToExport(event, state.pricing)),
  privacy:
    'This export contains usage numbers and local cost estimates only. It intentionally excludes prompts, completions, messages, API keys, and Authorization headers.',
});

export const stringifySessionJson = (payload: SessionExportPayload): string =>
  JSON.stringify(payload, null, 2);

export const stringifySessionCsv = (payload: SessionExportPayload): string => {
  const header = [
    'timestamp',
    'source',
    'scenarioName',
    'inputTokens',
    'outputTokens',
    'cachedInputTokens',
    'reasoningTokens',
    'directCost',
    'eventCost',
  ];

  const rows = payload.events.map((event) =>
    [
      event.timestamp,
      event.source,
      event.scenarioName,
      event.inputTokens,
      event.outputTokens,
      event.cachedInputTokens,
      event.reasoningTokens,
      event.directCost,
      event.eventCost,
    ]
      .map(csvCell)
      .join(','),
  );

  return [header.join(','), ...rows].join('\n');
};

export const stringifySessionMarkdown = (payload: SessionExportPayload): string =>
  [
    `# ${APP_NAME} Session Export`,
    '',
    `- Scenario: ${payload.scenarioName}`,
    `- Exported at: ${payload.exportedAt}`,
    `- Total burned: ${formatCurrency(payload.summary.totalCost)}`,
    `- Input cost: ${formatAdaptiveCurrency(payload.summary.inputCost)}`,
    `- Output cost: ${formatAdaptiveCurrency(payload.summary.outputCost)}`,
    `- Cached cost: ${formatAdaptiveCurrency(payload.summary.cachedCost)}`,
    `- Reasoning cost: ${formatAdaptiveCurrency(payload.summary.reasoningCost)}`,
    `- Destroyed bills: ${formatTokens(payload.summary.destroyedBills)}`,
    `- Current bill progress: ${formatPercent(payload.summary.currentBillProgressPercent / 100)}`,
    `- Usage events: ${formatTokens(payload.summary.usageEvents)}`,
    '',
    '## Recent Events',
    '',
    payload.events.length
      ? payload.events
          .map(
            (event) =>
              `- ${event.timestamp} · ${event.source} · ${event.scenarioName} · ${formatTokens(
                event.inputTokens + event.outputTokens + event.cachedInputTokens + event.reasoningTokens,
              )} tokens · ${formatAdaptiveCurrency(event.eventCost)}`,
          )
          .join('\n')
      : '- No usage events exported.',
    '',
    '## Privacy',
    '',
    payload.privacy,
  ].join('\n');
