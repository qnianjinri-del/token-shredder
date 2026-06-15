import { describe, expect, it } from 'vitest';
import type { AppState, CalculationResult } from '../types';
import { DEFAULT_STATE } from './presets';
import {
  buildChineseLaunchPost,
  buildEnglishLaunchPost,
  buildSummaryText,
} from './shareText';

const state: AppState = {
  ...DEFAULT_STATE,
  scenarioName: 'Launch smoke test',
};

const result: CalculationResult = {
  inputCost: 0.12,
  outputCost: 0.34,
  cachedCost: 0.02,
  reasoningCost: 0.07,
  costPerRun: 0.55,
  totalCost: 1.42,
  dailyCost: 0,
  monthlyCost: 0,
  destroyedBills: 1,
  currentBillProgress: 0.42,
  currentBillProgressPercent: 42,
  summarySentence: '这次运行已经碎掉 1 张完整纸币，下一张碎到 42%。',
};

describe('share text builders', () => {
  it('builds a detailed summary', () => {
    const text = buildSummaryText(state, result);

    expect(text).toContain('Launch smoke test');
    expect(text).toContain('$1.42');
    expect(text).toContain('当前纸币: 已碎 42%');
  });

  it('builds an English launch post with privacy and project link', () => {
    const text = buildEnglishLaunchPost(state, result);

    expect(text).toContain('Token Shredder');
    expect(text).toContain('$1.42');
    expect(text).toContain('no prompt logging');
    expect(text).toContain('https://github.com/qnianjinri-del/token-shredder');
  });

  it('builds a Chinese launch post with privacy and project link', () => {
    const text = buildChineseLaunchPost(state, result);

    expect(text).toContain('本机运行');
    expect(text).toContain('$1.42');
    expect(text).toContain('不上传数据');
    expect(text).toContain('https://github.com/qnianjinri-del/token-shredder');
  });
});
