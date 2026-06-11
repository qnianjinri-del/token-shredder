import { forwardRef } from 'react';
import type { AppState, CalculationResult } from '../types';
import { formatCurrency, formatPercent, formatTokens } from '../lib/formatting';

interface SummaryCardProps {
  state: AppState;
  result: CalculationResult;
}

export const SummaryCard = forwardRef<HTMLDivElement, SummaryCardProps>(function SummaryCard(
  { state, result },
  ref,
) {
  return (
    <div
      ref={ref}
      className="w-full max-w-[760px] overflow-hidden border-4 border-slate-950 bg-[#fff9db] text-slate-950 shadow-[8px_8px_0_rgba(15,23,42,0.82)] dark:border-cyan-200 dark:bg-[#101522] dark:text-white"
    >
      <div className="border-b-4 border-slate-950 bg-[#111827] p-6 text-white dark:border-cyan-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-black uppercase text-cyan-200">Token Shredder</div>
            <h3 className="mt-2 text-3xl font-black">{state.scenarioName || '未命名运行'}</h3>
          </div>
          <div className="border-4 border-cyan-200 bg-cyan-200 px-4 py-3 text-right text-slate-950">
            <div className="text-xs font-black uppercase text-slate-500">总消耗</div>
            <div className="text-3xl font-black">{formatCurrency(result.totalCost)}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-5 p-6 sm:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative h-32 border-4 border-slate-950 bg-emerald-100 p-3 dark:border-cyan-200">
          <div
            className="absolute inset-x-3 bottom-3 overflow-hidden"
            style={{ height: `${Math.max(8, (1 - result.currentBillProgress) * 92)}px` }}
          >
            <div className="pixel-share-bill">
              <span>TOKEN</span>
              <strong>$1</strong>
            </div>
          </div>
          <div className="absolute bottom-2 left-3 right-3 h-3 border-2 border-slate-950 bg-slate-900/15">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${result.currentBillProgressPercent}%` }}
            />
          </div>
        </div>
        <div className="grid content-center gap-3">
          <p className="text-xl font-black">{result.summarySentence}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="border-4 border-slate-950 bg-slate-100 p-3 dark:border-cyan-200 dark:bg-white/10">
              <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                完整纸币
              </div>
              <div className="text-2xl font-black">{formatTokens(result.destroyedBills)}</div>
            </div>
            <div className="border-4 border-slate-950 bg-slate-100 p-3 dark:border-cyan-200 dark:bg-white/10">
              <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
                当前纸币
              </div>
              <div className="text-2xl font-black">{formatPercent(result.currentBillProgress)}</div>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            价格为可编辑示例值，请替换为你自己的真实价格。
          </p>
        </div>
      </div>
    </div>
  );
});
