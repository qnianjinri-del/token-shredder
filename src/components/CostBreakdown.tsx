import type { CalculationResult } from '../types';
import { formatAdaptiveCurrency, formatCurrency, formatPercent, formatTokens } from '../lib/formatting';

interface CostBreakdownProps {
  result: CalculationResult;
}

interface MetricProps {
  label: string;
  value: string;
  tone?: 'hot' | 'cool' | 'plain';
}

function Metric({ label, value, tone = 'plain' }: MetricProps) {
  const toneClass =
    tone === 'hot'
      ? 'text-rose-700 dark:text-rose-200'
      : tone === 'cool'
        ? 'text-cyan-700 dark:text-cyan-200'
        : 'text-slate-950 dark:text-white';

  return (
    <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
      <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-lg font-black ${toneClass}`}>{value}</div>
    </div>
  );
}

export function CostBreakdown({ result }: CostBreakdownProps) {
  return (
    <section className="glass-panel p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">成本明细</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {result.summarySentence}
          </p>
        </div>
        <div className="rounded-lg bg-slate-950 px-4 py-2 text-right text-white shadow-glow dark:bg-white dark:text-slate-950">
          <div className="text-[11px] font-black uppercase opacity-70">总消耗</div>
          <div className="text-2xl font-black">{formatCurrency(result.totalCost)}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="当前 session 成本" value={formatCurrency(result.costPerRun)} tone="hot" />
        <Metric label="输入成本" value={formatAdaptiveCurrency(result.inputCost)} />
        <Metric label="输出成本" value={formatAdaptiveCurrency(result.outputCost)} />
        <Metric label="缓存成本" value={formatAdaptiveCurrency(result.cachedCost)} />
        <Metric label="推理成本" value={formatAdaptiveCurrency(result.reasoningCost)} />
        <Metric label="完整碎掉的纸币" value={formatTokens(result.destroyedBills)} tone="cool" />
        <Metric label="当前纸币进度" value={formatPercent(result.currentBillProgress)} tone="cool" />
      </div>
    </section>
  );
}
