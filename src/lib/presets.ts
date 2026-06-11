import type { AppState, Preset } from '../types';
import { PET_SCALE_DEFAULT, PET_SKIN_DEFAULT } from './pet';

export const CUSTOM_PRESET_ID = 'custom';

export const presets: Preset[] = [
  {
    id: CUSTOM_PRESET_ID,
    name: '自定义',
    inputPricePerMillion: 1,
    outputPricePerMillion: 4,
    cachedInputPricePerMillion: 0.25,
    reasoningPricePerMillion: 6,
    defaultInputTokens: 120_000,
    defaultOutputTokens: 40_000,
    defaultCachedInputTokens: 60_000,
    defaultReasoningTokens: 12_000,
  },
  {
    id: 'cheap-model-example',
    name: '便宜模型示例',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    cachedInputPricePerMillion: 0.05,
    reasoningPricePerMillion: 0.8,
    defaultInputTokens: 180_000,
    defaultOutputTokens: 55_000,
    defaultCachedInputTokens: 80_000,
    defaultReasoningTokens: 0,
  },
  {
    id: 'expensive-model-example',
    name: '昂贵模型示例',
    inputPricePerMillion: 7,
    outputPricePerMillion: 28,
    cachedInputPricePerMillion: 1.5,
    reasoningPricePerMillion: 35,
    defaultInputTokens: 450_000,
    defaultOutputTokens: 160_000,
    defaultCachedInputTokens: 150_000,
    defaultReasoningTokens: 40_000,
  },
  {
    id: 'coding-agent-example',
    name: '编程 Agent 示例',
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    cachedInputPricePerMillion: 0.75,
    reasoningPricePerMillion: 18,
    defaultInputTokens: 900_000,
    defaultOutputTokens: 210_000,
    defaultCachedInputTokens: 620_000,
    defaultReasoningTokens: 95_000,
  },
  {
    id: 'long-context-example',
    name: '长上下文示例',
    inputPricePerMillion: 2.25,
    outputPricePerMillion: 9,
    cachedInputPricePerMillion: 0.35,
    reasoningPricePerMillion: 12,
    defaultInputTokens: 2_400_000,
    defaultOutputTokens: 180_000,
    defaultCachedInputTokens: 1_600_000,
    defaultReasoningTokens: 30_000,
  },
];

export const DEFAULT_STATE: AppState = {
  scenarioName: '我的 Agent 运行',
  visualMode: 'money-shredder',
  petSkin: PET_SKIN_DEFAULT,
  costMode: 'token-usage',
  presetId: 'coding-agent-example',
  pricing: {
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    cachedInputPricePerMillion: 0.75,
    reasoningPricePerMillion: 18,
  },
  usage: {
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    reasoningTokens: 0,
    numberOfRuns: 1,
    runsPerDay: 0,
    daysPerMonth: 30,
  },
  directCost: 0,
  monitoring: {
    events: [],
    directCostTotal: 0,
  },
  demoMode: 'off',
  onboardingComplete: false,
  petScale: PET_SCALE_DEFAULT,
  theme: 'dark',
};

export const findPreset = (presetId: string): Preset | undefined =>
  presets.find((preset) => preset.id === presetId);

export const applyPresetToState = (state: AppState, presetId: string): AppState => {
  const preset = findPreset(presetId);
  if (!preset || preset.id === CUSTOM_PRESET_ID) {
    return { ...state, presetId: CUSTOM_PRESET_ID };
  }

  return {
    ...state,
    presetId: preset.id,
    pricing: {
      inputPricePerMillion: preset.inputPricePerMillion,
      outputPricePerMillion: preset.outputPricePerMillion,
      cachedInputPricePerMillion: preset.cachedInputPricePerMillion,
      reasoningPricePerMillion: preset.reasoningPricePerMillion,
    },
    usage: {
      ...state.usage,
      inputTokens: preset.defaultInputTokens,
      outputTokens: preset.defaultOutputTokens,
      cachedInputTokens: preset.defaultCachedInputTokens,
      reasoningTokens: preset.defaultReasoningTokens,
    },
  };
};
