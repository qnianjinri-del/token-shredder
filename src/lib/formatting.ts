export const clampNonNegative = (value: number): number => {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, value);
};

export const parseNonNegativeNumber = (value: string): number => {
  const parsed = Number(value.replace(/,/g, '').trim());
  return clampNonNegative(parsed);
};

export const formatCurrency = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(clampNonNegative(value));

export const formatAdaptiveCurrency = (value: number): string => {
  const safeValue = clampNonNegative(value);
  const maxDigits = safeValue > 0 && safeValue < 0.01 ? 6 : 2;
  return formatCurrency(safeValue, maxDigits);
};

export const formatTokens = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(clampNonNegative(value)));

export const formatNumber = (value: number, maximumFractionDigits = 2): string =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(clampNonNegative(value));

export const formatPercent = (value: number): string =>
  `${Math.round(clampNonNegative(value) * 100)}%`;

export const numberForInput = (value: number): string => {
  const safeValue = clampNonNegative(value);
  if (Number.isInteger(safeValue)) {
    return String(safeValue);
  }

  return String(safeValue);
};
