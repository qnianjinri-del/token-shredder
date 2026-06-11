import type { Pricing, UsageEvent } from '../types';
import { clampNonNegative } from './formatting';

const ONE_MILLION = 1_000_000;

export const calculateUsageEventCost = (event: UsageEvent, pricing: Pricing): number => {
  const inputCost =
    (clampNonNegative(event.inputTokens) / ONE_MILLION) *
    clampNonNegative(pricing.inputPricePerMillion);
  const outputCost =
    (clampNonNegative(event.outputTokens) / ONE_MILLION) *
    clampNonNegative(pricing.outputPricePerMillion);
  const cachedCost =
    (clampNonNegative(event.cachedInputTokens) / ONE_MILLION) *
    clampNonNegative(pricing.cachedInputPricePerMillion);
  const reasoningCost =
    (clampNonNegative(event.reasoningTokens) / ONE_MILLION) *
    clampNonNegative(pricing.reasoningPricePerMillion);

  return inputCost + outputCost + cachedCost + reasoningCost + clampNonNegative(event.directCost);
};
