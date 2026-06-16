import type { Pricing } from '../types';
import { formatCurrency } from '../lib/formatting';
import { CUSTOM_PRESET_ID, presets } from '../lib/presets';
import { NumberInput } from './NumberInput';

interface PricingPanelProps {
  presetId: string;
  pricing: Pricing;
  onPresetChange: (presetId: string) => void;
  onPricingChange: (pricing: Pricing) => void;
}

export function PricingPanel({
  presetId,
  pricing,
  onPresetChange,
  onPricingChange,
}: PricingPanelProps) {
  const updatePricing = (patch: Partial<Pricing>) => {
    onPricingChange({ ...pricing, ...patch });
  };

  return (
    <div id="pricing" className="glass-panel scroll-mt-4 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">价格配置</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            以下只是可编辑示例价格，不是实时官方价格。
          </p>
        </div>
        <span className="border-4 border-slate-950 bg-amber-200 px-2 py-1 text-[11px] font-black uppercase text-amber-950 dark:border-cyan-200 dark:bg-amber-300 dark:text-slate-950">
          可编辑
        </span>
      </div>

      <label className="mt-4 block">
        <span className="control-label">价格预设</span>
        <select
          value={presetId}
          onChange={(event) => onPresetChange(event.target.value)}
          className="mt-1 w-full border-4 border-slate-950 bg-white px-3 py-2.5 text-sm font-black text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.72)] outline-none transition focus:bg-cyan-50 dark:border-cyan-200 dark:bg-[#0f172a] dark:text-white dark:shadow-[4px_4px_0_rgba(103,232,249,0.22)] dark:focus:bg-[#172033]"
        >
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberInput
          label="输入价格"
          value={pricing.inputPricePerMillion}
          onChange={(value) => updatePricing({ inputPricePerMillion: value })}
          prefix="$"
          suffix="/ 1M"
          helper={`${formatCurrency(pricing.inputPricePerMillion)} / 100 万 tokens`}
        />
        <NumberInput
          label="输出价格"
          value={pricing.outputPricePerMillion}
          onChange={(value) => updatePricing({ outputPricePerMillion: value })}
          prefix="$"
          suffix="/ 1M"
          helper={`${formatCurrency(pricing.outputPricePerMillion)} / 100 万 tokens`}
        />
        <NumberInput
          label="缓存输入价格"
          value={pricing.cachedInputPricePerMillion}
          onChange={(value) => updatePricing({ cachedInputPricePerMillion: value })}
          prefix="$"
          suffix="/ 1M"
          helper={`${formatCurrency(pricing.cachedInputPricePerMillion)} / 100 万 tokens`}
        />
        <NumberInput
          label="推理 token 价格"
          value={pricing.reasoningPricePerMillion}
          onChange={(value) => updatePricing({ reasoningPricePerMillion: value })}
          prefix="$"
          suffix="/ 1M"
          helper={`${formatCurrency(pricing.reasoningPricePerMillion)} / 100 万 tokens`}
        />
      </div>
      {presetId === CUSTOM_PRESET_ID ? (
        <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          自定义价格会保存在本机。
        </p>
      ) : null}
    </div>
  );
}
