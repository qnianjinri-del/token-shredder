import type { AppState } from '../types';
import { applyPresetToState, presets } from './presets';

const scenarios = [
  'Friday night agent sprint',
  'Bug hunt batch job',
  'Long context archaeology',
  'Release notes machine',
  'My Codex-like run',
  'Claude-like session',
  'Agent swarm experiment',
  'Docs rewrite marathon',
];

const randomInt = (min: number, max: number): number =>
  Math.round(min + Math.random() * (max - min));

const randomFloat = (min: number, max: number, digits = 2): number =>
  Number((min + Math.random() * (max - min)).toFixed(digits));

export const createRandomDemo = (state: AppState): AppState => {
  const samplePresets = presets.filter((preset) => preset.id !== 'custom');
  const preset = samplePresets[randomInt(0, samplePresets.length - 1)];
  const withPreset = applyPresetToState(state, preset.id);

  return {
    ...withPreset,
    scenarioName: scenarios[randomInt(0, scenarios.length - 1)],
    visualMode: 'money-shredder',
    costMode: Math.random() > 0.22 ? 'token-usage' : 'direct-cost',
    usage: {
      inputTokens: randomInt(20_000, 2_800_000),
      outputTokens: randomInt(5_000, 420_000),
      cachedInputTokens: randomInt(0, 1_800_000),
      reasoningTokens: randomInt(0, 160_000),
      numberOfRuns: randomInt(1, 6),
      runsPerDay: randomInt(1, 18),
      daysPerMonth: randomInt(20, 31),
    },
    directCost: randomFloat(0.35, 9.85),
  };
};
