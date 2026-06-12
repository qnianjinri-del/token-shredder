import type { UsageEvent } from '../types';

export const QUICK_START_SCENARIO_NAME = '一键试玩：Agent 碎钱演示';

export const createQuickStartUsageEvent = (timestamp = Date.now()): UsageEvent => ({
  id: `quick-start-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
  timestamp,
  source: '本地一键试玩',
  scenarioName: QUICK_START_SCENARIO_NAME,
  inputTokens: 160_000,
  outputTokens: 48_000,
  cachedInputTokens: 60_000,
  reasoningTokens: 6_000,
  directCost: 0,
});
