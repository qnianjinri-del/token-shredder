import type { TokenUsage } from '../types';
import { formatCurrency, formatTokens } from '../lib/formatting';
import { NumberInput } from './NumberInput';

interface DirectCostPanelProps {
  scenarioName: string;
  directCost: number;
  usage: TokenUsage;
  onScenarioNameChange: (value: string) => void;
  onDirectCostChange: (value: number) => void;
  onUsageChange: (patch: Partial<TokenUsage>) => void;
}

export function DirectCostPanel({
  scenarioName,
  directCost,
  usage,
  onScenarioNameChange,
  onDirectCostChange,
  onUsageChange,
}: DirectCostPanelProps) {
  return (
    <div className="glass-panel p-4">
      <div className="grid gap-4">
        <label className="block">
          <span className="control-label">场景名称</span>
          <input
            type="text"
            value={scenarioName}
            onChange={(event) => onScenarioNameChange(event.target.value)}
            className="mt-1 w-full border-4 border-slate-950 bg-white px-3 py-2.5 text-sm font-black text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.72)] outline-none transition placeholder:text-slate-400 focus:bg-cyan-50 dark:border-cyan-200 dark:bg-[#0f172a] dark:text-white dark:shadow-[4px_4px_0_rgba(103,232,249,0.22)] dark:focus:bg-[#172033]"
            placeholder="Agent 批量任务"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberInput
            label="单次成本"
            value={directCost}
            onChange={onDirectCostChange}
            prefix="$"
            helper={formatCurrency(directCost)}
          />
          <NumberInput
            label="运行次数"
            value={usage.numberOfRuns}
            onChange={(value) => onUsageChange({ numberOfRuns: value })}
            helper={`${formatTokens(usage.numberOfRuns)} 次`}
          />
          <NumberInput
            label="每天运行次数"
            value={usage.runsPerDay}
            onChange={(value) => onUsageChange({ runsPerDay: value })}
            helper={`每天 ${formatTokens(usage.runsPerDay)} 次`}
          />
          <NumberInput
            label="每月天数"
            value={usage.daysPerMonth}
            onChange={(value) => onUsageChange({ daysPerMonth: value })}
            helper={`${formatTokens(usage.daysPerMonth)} 天`}
          />
        </div>
      </div>
    </div>
  );
}
