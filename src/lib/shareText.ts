import type { AppState, CalculationResult } from '../types';
import { formatCurrency, formatPercent } from './formatting';

const projectUrl = 'https://github.com/qnianjinri-del/token-shredder';

export const buildSummaryText = (state: AppState, result: CalculationResult): string => `Token Shredder 摘要:
场景: ${state.scenarioName || '未命名运行'}
总消耗: ${formatCurrency(result.totalCost)}
单次成本: ${formatCurrency(result.costPerRun)}
完整碎掉的纸币: ${result.destroyedBills}
当前纸币: 已碎 ${formatPercent(result.currentBillProgress)}
输入成本: ${formatCurrency(result.inputCost)}
输出成本: ${formatCurrency(result.outputCost)}
缓存成本: ${formatCurrency(result.cachedCost)}
推理成本: ${formatCurrency(result.reasoningCost)}`;

export const buildEnglishLaunchPost = (state: AppState, result: CalculationResult): string =>
  [
    `I tried Token Shredder: a tiny local desktop pet that shreds AI token spend in real time.`,
    `${state.scenarioName || 'This run'} burned ${formatCurrency(result.totalCost)} and shredded ${result.destroyedBills} full bill(s), with the next bill at ${formatPercent(result.currentBillProgress)}.`,
    `Local-first, no prompt logging, no cloud account.`,
    projectUrl,
  ].join('\n\n');

export const buildChineseLaunchPost = (state: AppState, result: CalculationResult): string =>
  [
    `我在试 Token Shredder：一个本机运行的 AI token 成本桌面宠物。`,
    `${state.scenarioName || '这次运行'} 估算消耗 ${formatCurrency(result.totalCost)}，已经碎掉 ${result.destroyedBills} 张完整纸币，下一张碎到 ${formatPercent(result.currentBillProgress)}。`,
    `本机运行，不上传数据，不需要记录 prompt/completion。`,
    projectUrl,
  ].join('\n\n');
