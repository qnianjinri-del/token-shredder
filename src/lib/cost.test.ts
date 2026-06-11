import { describe, expect, it } from 'vitest';
import type { AppState } from '../types';
import { calculateCost } from './cost';
import { DEFAULT_STATE } from './presets';

const makeState = (overrides: Partial<AppState>): AppState => ({
  ...DEFAULT_STATE,
  ...overrides,
  pricing: {
    ...DEFAULT_STATE.pricing,
    ...(overrides.pricing ?? {}),
  },
  usage: {
    ...DEFAULT_STATE.usage,
    ...(overrides.usage ?? {}),
  },
  monitoring: {
    ...DEFAULT_STATE.monitoring,
    ...(overrides.monitoring ?? {}),
  },
});

describe('calculateCost', () => {
  it('calculates 0.70 dollars and partial bill progress', () => {
    const result = calculateCost(
      makeState({
        costMode: 'direct-cost',
        directCost: 0.7,
        usage: { ...DEFAULT_STATE.usage, numberOfRuns: 1 },
      }),
    );

    expect(result.totalCost).toBeCloseTo(0.7);
    expect(result.destroyedBills).toBe(0);
    expect(result.currentBillProgress).toBeCloseTo(0.7);
  });

  it('calculates exactly 1.00 as one destroyed bill and zero current progress', () => {
    const result = calculateCost(
      makeState({
        costMode: 'direct-cost',
        directCost: 1,
        usage: { ...DEFAULT_STATE.usage, numberOfRuns: 1 },
      }),
    );

    expect(result.totalCost).toBeCloseTo(1);
    expect(result.destroyedBills).toBe(1);
    expect(result.currentBillProgress).toBe(0);
  });

  it('calculates 1.35 dollars as one destroyed bill and 35 percent current progress', () => {
    const result = calculateCost(
      makeState({
        costMode: 'direct-cost',
        directCost: 1.35,
        usage: { ...DEFAULT_STATE.usage, numberOfRuns: 1 },
      }),
    );

    expect(result.totalCost).toBeCloseTo(1.35);
    expect(result.destroyedBills).toBe(1);
    expect(result.currentBillProgress).toBeCloseTo(0.35);
  });

  it('includes cached and reasoning cost in token usage mode', () => {
    const result = calculateCost(
      makeState({
        costMode: 'token-usage',
        pricing: {
          inputPricePerMillion: 2,
          outputPricePerMillion: 10,
          cachedInputPricePerMillion: 0.5,
          reasoningPricePerMillion: 20,
        },
        usage: {
          inputTokens: 1_000_000,
          outputTokens: 500_000,
          cachedInputTokens: 2_000_000,
          reasoningTokens: 100_000,
          numberOfRuns: 1,
          runsPerDay: 1,
          daysPerMonth: 30,
        },
      }),
    );

    expect(result.inputCost).toBeCloseTo(2);
    expect(result.outputCost).toBeCloseTo(5);
    expect(result.cachedCost).toBeCloseTo(1);
    expect(result.reasoningCost).toBeCloseTo(2);
    expect(result.costPerRun).toBeCloseTo(10);
  });

  it('uses direct cost mode for total, daily, and monthly cost', () => {
    const result = calculateCost(
      makeState({
        costMode: 'direct-cost',
        directCost: 2.5,
        usage: {
          ...DEFAULT_STATE.usage,
          numberOfRuns: 4,
          runsPerDay: 3,
          daysPerMonth: 31,
        },
      }),
    );

    expect(result.costPerRun).toBeCloseTo(2.5);
    expect(result.totalCost).toBeCloseTo(10);
    expect(result.dailyCost).toBeCloseTo(7.5);
    expect(result.monthlyCost).toBeCloseTo(232.5);
  });

  it('clamps negative and NaN values while calculating cost', () => {
    const result = calculateCost(
      makeState({
        costMode: 'token-usage',
        pricing: {
          inputPricePerMillion: Number.NaN,
          outputPricePerMillion: -10,
          cachedInputPricePerMillion: 1,
          reasoningPricePerMillion: 2,
        },
        usage: {
          inputTokens: -1,
          outputTokens: Number.NaN,
          cachedInputTokens: 1_000_000,
          reasoningTokens: 1_000_000,
          numberOfRuns: 1,
          runsPerDay: 0,
          daysPerMonth: 30,
        },
      }),
    );

    expect(result.inputCost).toBe(0);
    expect(result.outputCost).toBe(0);
    expect(result.cachedCost).toBe(1);
    expect(result.reasoningCost).toBe(2);
    expect(result.totalCost).toBeCloseTo(3);
  });

  it('uses monitoring totals without multiplying by run count', () => {
    const result = calculateCost(
      makeState({
        costMode: 'token-usage',
        pricing: {
          inputPricePerMillion: 1,
          outputPricePerMillion: 2,
          cachedInputPricePerMillion: 0.5,
          reasoningPricePerMillion: 4,
        },
        usage: {
          inputTokens: 1_000_000,
          outputTokens: 1_000_000,
          cachedInputTokens: 1_000_000,
          reasoningTokens: 1_000_000,
          numberOfRuns: 99,
          runsPerDay: 99,
          daysPerMonth: 30,
        },
        monitoring: {
          directCostTotal: 0.25,
          events: [
            {
              id: 'event',
              timestamp: 1,
              source: 'test',
              scenarioName: 'monitoring',
              inputTokens: 1,
              outputTokens: 1,
              cachedInputTokens: 0,
              reasoningTokens: 0,
              directCost: 0,
            },
          ],
        },
      }),
    );

    expect(result.totalCost).toBeCloseTo(7.75);
    expect(result.dailyCost).toBe(0);
    expect(result.monthlyCost).toBe(0);
  });
});
