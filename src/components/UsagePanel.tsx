import type { TokenUsage } from '../types';
import { formatTokens } from '../lib/formatting';
import { NumberInput } from './NumberInput';

interface UsagePanelProps {
  scenarioName: string;
  usage: TokenUsage;
  onScenarioNameChange: (value: string) => void;
  onUsageChange: (patch: Partial<TokenUsage>) => void;
}

export function UsagePanel({
  scenarioName,
  usage,
  onScenarioNameChange,
  onUsageChange,
}: UsagePanelProps) {
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
            placeholder="我的 Agent 运行"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberInput
            label="输入 tokens"
            value={usage.inputTokens}
            onChange={(value) => onUsageChange({ inputTokens: value })}
            helper={formatTokens(usage.inputTokens)}
          />
          <NumberInput
            label="输出 tokens"
            value={usage.outputTokens}
            onChange={(value) => onUsageChange({ outputTokens: value })}
            helper={formatTokens(usage.outputTokens)}
          />
          <NumberInput
            label="缓存输入 tokens"
            value={usage.cachedInputTokens}
            onChange={(value) => onUsageChange({ cachedInputTokens: value })}
            helper={formatTokens(usage.cachedInputTokens)}
          />
          <NumberInput
            label="推理 tokens"
            value={usage.reasoningTokens}
            onChange={(value) => onUsageChange({ reasoningTokens: value })}
            helper={formatTokens(usage.reasoningTokens)}
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
