import type { AppState, CalculationResult } from '../types';
import { clampNonNegative } from './formatting';

const ONE_MILLION = 1_000_000;
const EPSILON = 1e-9;

const normalizeBillProgress = (totalCost: number) => {
  const safeTotal = clampNonNegative(totalCost);
  let destroyedBills = Math.floor(safeTotal + EPSILON);
  let currentBillProgress = safeTotal - destroyedBills;

  if (currentBillProgress < EPSILON) {
    currentBillProgress = 0;
  }

  if (1 - currentBillProgress < EPSILON) {
    destroyedBills += 1;
    currentBillProgress = 0;
  }

  return {
    destroyedBills,
    currentBillProgress,
    currentBillProgressPercent: Math.round(currentBillProgress * 100),
  };
};

const makeSummarySentence = (destroyedBills: number, currentBillProgressPercent: number): string => {
  return `这次运行已经碎掉 ${destroyedBills} 张完整纸币，下一张碎到 ${currentBillProgressPercent}%。`;
};

export const calculateCost = (state: AppState): CalculationResult => {
  const hasMonitoringEvents = state.monitoring.events.length > 0;
  const numberOfRuns = clampNonNegative(state.usage.numberOfRuns);
  const runsPerDay = clampNonNegative(state.usage.runsPerDay);
  const daysPerMonth = clampNonNegative(state.usage.daysPerMonth);

  let inputCost = 0;
  let outputCost = 0;
  let cachedCost = 0;
  let reasoningCost = 0;
  let costPerRun = 0;

  if (!hasMonitoringEvents && state.costMode === 'direct-cost') {
    costPerRun = clampNonNegative(state.directCost);
  } else {
    inputCost =
      (clampNonNegative(state.usage.inputTokens) / ONE_MILLION) *
      clampNonNegative(state.pricing.inputPricePerMillion);
    outputCost =
      (clampNonNegative(state.usage.outputTokens) / ONE_MILLION) *
      clampNonNegative(state.pricing.outputPricePerMillion);
    cachedCost =
      (clampNonNegative(state.usage.cachedInputTokens) / ONE_MILLION) *
      clampNonNegative(state.pricing.cachedInputPricePerMillion);
    reasoningCost =
      (clampNonNegative(state.usage.reasoningTokens) / ONE_MILLION) *
      clampNonNegative(state.pricing.reasoningPricePerMillion);
    costPerRun =
      inputCost +
      outputCost +
      cachedCost +
      reasoningCost +
      (hasMonitoringEvents ? clampNonNegative(state.monitoring.directCostTotal) : 0);
  }

  const totalCost = hasMonitoringEvents ? costPerRun : costPerRun * numberOfRuns;
  const dailyCost = hasMonitoringEvents ? 0 : costPerRun * runsPerDay;
  const monthlyCost = dailyCost * daysPerMonth;
  const billState = normalizeBillProgress(totalCost);

  return {
    inputCost,
    outputCost,
    cachedCost,
    reasoningCost,
    costPerRun,
    totalCost,
    dailyCost,
    monthlyCost,
    ...billState,
    summarySentence: makeSummarySentence(
      billState.destroyedBills,
      billState.currentBillProgressPercent,
    ),
  };
};
