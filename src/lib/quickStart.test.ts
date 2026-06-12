import { describe, expect, it } from 'vitest';
import { QUICK_START_SCENARIO_NAME, createQuickStartUsageEvent } from './quickStart';

describe('createQuickStartUsageEvent', () => {
  it('creates a local usage event that can drive first-run pet motion', () => {
    const event = createQuickStartUsageEvent(123);

    expect(event.id).toContain('quick-start-123');
    expect(event.timestamp).toBe(123);
    expect(event.source).toBe('本地一键试玩');
    expect(event.scenarioName).toBe(QUICK_START_SCENARIO_NAME);
    expect(event.inputTokens).toBeGreaterThan(0);
    expect(event.outputTokens).toBeGreaterThan(0);
    expect(event.cachedInputTokens).toBeGreaterThanOrEqual(0);
    expect(event.reasoningTokens).toBeGreaterThanOrEqual(0);
    expect(event.directCost).toBe(0);
  });
});
