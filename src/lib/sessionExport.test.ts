import { describe, expect, it } from 'vitest';
import type { AppState, CalculationResult } from '../types';
import { DEFAULT_STATE } from './presets';
import {
  createSessionExportPayload,
  stringifySessionCsv,
  stringifySessionJson,
  stringifySessionMarkdown,
} from './sessionExport';

const result: CalculationResult = {
  inputCost: 0.3,
  outputCost: 0.45,
  cachedCost: 0.02,
  reasoningCost: 0.12,
  costPerRun: 0.89,
  totalCost: 1.42,
  dailyCost: 0,
  monthlyCost: 0,
  destroyedBills: 1,
  currentBillProgress: 0.42,
  currentBillProgressPercent: 42,
  summarySentence: 'test',
};

describe('session export helpers', () => {
  it('exports session summary and events without private content', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      scenarioName: 'Repo cleanup',
      monitoring: {
        directCostTotal: 0,
        events: [
          {
            id: 'event-1',
            timestamp: 1_800_000_000_000,
            source: 'my-agent',
            scenarioName: 'Repo cleanup',
            inputTokens: 1000,
            outputTokens: 500,
            cachedInputTokens: 100,
            reasoningTokens: 20,
            directCost: 0,
          },
        ],
      },
    };

    const payload = createSessionExportPayload(state, result, '2026-01-01T00:00:00.000Z');
    const json = stringifySessionJson(payload);
    const csv = stringifySessionCsv(payload);
    const markdown = stringifySessionMarkdown(payload);

    expect(payload.summary.totalCost).toBe(1.42);
    expect(payload.events).toHaveLength(1);
    expect(csv).toContain('timestamp,source,scenarioName');
    expect(markdown).toContain('Total burned: $1.42');
    expect(json).not.toContain('secret-key');
    expect(json).not.toContain('raw prompt text');
    expect(json).not.toContain('raw completion text');
  });

  it('escapes CSV cells', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      monitoring: {
        directCostTotal: 0,
        events: [
          {
            id: 'event-1',
            timestamp: 1_800_000_000_000,
            source: 'agent, with comma',
            scenarioName: 'quote "test"',
            inputTokens: 1,
            outputTokens: 1,
            cachedInputTokens: 0,
            reasoningTokens: 0,
            directCost: 0,
          },
        ],
      },
    };

    const csv = stringifySessionCsv(createSessionExportPayload(state, result));

    expect(csv).toContain('"agent, with comma"');
    expect(csv).toContain('"quote ""test"""');
  });
});
