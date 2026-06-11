import { Calculator, DollarSign, RotateCcw, Shuffle, X } from 'lucide-react';
import type { AppState, CalculationResult, CostMode, PetSkinId, Pricing, TokenUsage } from '../types';
import { CostBreakdown } from './CostBreakdown';
import { DirectCostPanel } from './DirectCostPanel';
import { PetSkinPanel } from './PetSkinPanel';
import { PetSizePanel } from './PetSizePanel';
import { PricingPanel } from './PricingPanel';
import { SharePanel } from './SharePanel';
import { UsagePanel } from './UsagePanel';

interface SetupPanelProps {
  isOpen: boolean;
  state: AppState;
  result: CalculationResult;
  onClose: () => void;
  onCostModeChange: (mode: CostMode) => void;
  onScenarioNameChange: (value: string) => void;
  onUsageChange: (patch: Partial<TokenUsage>) => void;
  onPricingChange: (pricing: Pricing) => void;
  onPresetChange: (presetId: string) => void;
  onDirectCostChange: (value: number) => void;
  onPetScaleChange: (value: number) => void;
  onPetSkinChange: (value: PetSkinId) => void;
  onReset: () => void;
  onRandomDemo: () => void;
}

export function SetupPanel({
  isOpen,
  state,
  result,
  onClose,
  onCostModeChange,
  onScenarioNameChange,
  onUsageChange,
  onPricingChange,
  onPresetChange,
  onDirectCostChange,
  onPetScaleChange,
  onPetSkinChange,
  onReset,
  onRandomDemo,
}: SetupPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="关闭后台遮罩"
        className="fixed inset-0 z-30 bg-slate-950/50"
        onClick={onClose}
      />
      <aside
        className="fixed right-0 top-0 z-40 h-dvh w-full max-w-[560px] overflow-y-auto border-l-4 border-slate-950 bg-[#f4f0d7] p-4 text-slate-950 shadow-[-10px_0_0_rgba(15,23,42,0.28)] dark:border-cyan-200 dark:bg-[#101522] dark:text-white"
      >
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-4 border-b-4 border-slate-950 bg-[#f4f0d7] px-4 py-3 dark:border-cyan-200 dark:bg-[#101522]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase text-slate-600 dark:text-cyan-200">后台设置</p>
              <h2 className="text-xl font-black">配置计费宠物</h2>
            </div>
            <button type="button" onClick={onClose} className="pixel-icon-button" aria-label="关闭后台">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-4">
            <span className="control-label">计费模式</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onCostModeChange('token-usage')}
                className={`mode-button ${state.costMode === 'token-usage' ? 'mode-button-active' : ''}`}
              >
                <Calculator size={16} />
                <span>按 token 计算</span>
              </button>
              <button
                type="button"
                onClick={() => onCostModeChange('direct-cost')}
                className={`mode-button ${state.costMode === 'direct-cost' ? 'mode-button-active' : ''}`}
              >
                <DollarSign size={16} />
                <span>直接输入金额</span>
              </button>
            </div>
          </div>

          <PetSizePanel petScale={state.petScale} onPetScaleChange={onPetScaleChange} />

          <PetSkinPanel petSkin={state.petSkin} onPetSkinChange={onPetSkinChange} />

          {state.costMode === 'token-usage' ? (
            <>
              <UsagePanel
                scenarioName={state.scenarioName}
                usage={state.usage}
                onScenarioNameChange={onScenarioNameChange}
                onUsageChange={onUsageChange}
              />
              <PricingPanel
                presetId={state.presetId}
                pricing={state.pricing}
                onPresetChange={onPresetChange}
                onPricingChange={onPricingChange}
              />
            </>
          ) : (
            <DirectCostPanel
              scenarioName={state.scenarioName}
              directCost={state.directCost}
              usage={state.usage}
              onScenarioNameChange={onScenarioNameChange}
              onDirectCostChange={onDirectCostChange}
              onUsageChange={onUsageChange}
            />
          )}

          <div className="glass-panel flex flex-wrap gap-2 p-4">
            <button type="button" onClick={onReset} className="action-button">
              <RotateCcw size={16} />
              <span>重置</span>
            </button>
            <button type="button" onClick={onRandomDemo} className="action-button">
              <Shuffle size={16} />
              <span>随机示例</span>
            </button>
          </div>

          <CostBreakdown result={result} />
          <SharePanel state={state} result={result} />
        </div>
      </aside>
    </>
  );
}
