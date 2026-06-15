import { RotateCcw } from 'lucide-react';
import type {
  AppState,
  CalculationResult,
  ConfigureProviderResult,
  DemoMode,
  MonitorInfo,
  PetSkinId,
  PetRuntimeState,
  Pricing,
  ProviderConfig,
  ProviderTestResult,
} from '../types';
import { CostBreakdown } from './CostBreakdown';
import { DemoModePanel } from './DemoModePanel';
import { MonitorPanel } from './MonitorPanel';
import { OnboardingCard } from './OnboardingCard';
import { PetSkinPanel } from './PetSkinPanel';
import { PetSizePanel } from './PetSizePanel';
import { PricingPanel } from './PricingPanel';
import { ProviderSetupPanel } from './ProviderSetupPanel';
import { QuickVerifyPanel } from './QuickVerifyPanel';
import { SharePanel } from './SharePanel';
import { StatusPanel } from './StatusPanel';
import { ThemeToggle } from './ThemeToggle';

interface SettingsWindowProps {
  state: AppState;
  result: CalculationResult;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  onPricingChange: (pricing: Pricing) => void;
  onPresetChange: (presetId: string) => void;
  onProviderConfigChange: (config: ProviderConfig) => void;
  onConfigureProvider: (config: ProviderConfig) => Promise<ConfigureProviderResult>;
  onTestProvider: (config: ProviderConfig, prompt: string) => Promise<ProviderTestResult>;
  onPetScaleChange: (value: number) => void;
  onPetSkinChange: (value: PetSkinId) => void;
  onReset: () => void;
  onClearMonitoring: () => void;
  onSendTestUsageEvent: () => Promise<void>;
  onRunQuickStartDemo: () => void;
  onDemoModeChange: (mode: DemoMode) => void;
  onCompleteOnboarding: () => void;
  onReopenOnboarding: () => void;
  onToggleTheme: () => void;
}

export function SettingsWindow({
  state,
  result,
  runtimeState,
  monitorInfo,
  providerConfig,
  onPricingChange,
  onPresetChange,
  onProviderConfigChange,
  onConfigureProvider,
  onTestProvider,
  onPetScaleChange,
  onPetSkinChange,
  onReset,
  onClearMonitoring,
  onSendTestUsageEvent,
  onRunQuickStartDemo,
  onDemoModeChange,
  onCompleteOnboarding,
  onReopenOnboarding,
  onToggleTheme,
}: SettingsWindowProps) {
  return (
    <main className="min-h-screen bg-[#f4f0d7] p-4 text-slate-950 dark:bg-[#101522] dark:text-white">
      <div className="pixel-grid-bg pointer-events-none fixed inset-0" />
      <div className="relative mx-auto grid max-w-6xl gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-4">
          <div className="glass-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-600 dark:text-cyan-200">
                  Token Shredder 后台
                </p>
                <h1 className="text-2xl font-black">后台控制台</h1>
              </div>
              <ThemeToggle theme={state.theme} onToggle={onToggleTheme} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
              配好价格，把你的 Agent usage 自动发到本机；桌面只保留小宠物。
            </p>
            <button
              type="button"
              onClick={onReopenOnboarding}
              className="mt-3 text-xs font-black text-cyan-700 underline decoration-4 underline-offset-4 dark:text-cyan-200"
            >
              重新查看接入指南
            </button>
          </div>

          <QuickVerifyPanel
            monitorInfo={monitorInfo}
            onRunQuickStartDemo={onRunQuickStartDemo}
            onSendTestUsageEvent={onSendTestUsageEvent}
          />

          <PetSkinPanel petSkin={state.petSkin} onPetSkinChange={onPetSkinChange} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <PetSizePanel petScale={state.petScale} onPetScaleChange={onPetScaleChange} />
            <DemoModePanel demoMode={state.demoMode} onDemoModeChange={onDemoModeChange} />
          </div>

          {!state.onboardingComplete ? (
            <OnboardingCard
              monitorInfo={monitorInfo}
              providerConfig={providerConfig}
              onSendTestUsageEvent={onSendTestUsageEvent}
              onRunQuickStartDemo={onRunQuickStartDemo}
              onComplete={onCompleteOnboarding}
            />
          ) : null}

          <ProviderSetupPanel
            providerConfig={providerConfig}
            monitorInfo={monitorInfo}
            onProviderConfigChange={onProviderConfigChange}
            onConfigureProvider={onConfigureProvider}
            onTestProvider={onTestProvider}
            onRunQuickStartDemo={onRunQuickStartDemo}
          />

          <StatusPanel
            state={state}
            result={result}
            runtimeState={runtimeState}
            monitorInfo={monitorInfo}
            onClearMonitoring={onClearMonitoring}
            onSendTestUsageEvent={onSendTestUsageEvent}
            onRunQuickStartDemo={onRunQuickStartDemo}
          />

          <MonitorPanel
            state={state}
            monitorInfo={monitorInfo}
            onClearMonitoring={onClearMonitoring}
            onSendTestUsageEvent={onSendTestUsageEvent}
          />

          <PricingPanel
            presetId={state.presetId}
            pricing={state.pricing}
            onPresetChange={onPresetChange}
            onPricingChange={onPricingChange}
          />

          <div className="glass-panel flex flex-wrap gap-2 p-4">
            <button type="button" onClick={onReset} className="action-button">
              <RotateCcw size={16} />
              <span>重置全部配置</span>
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <CostBreakdown result={result} />
          <SharePanel state={state} result={result} />
        </section>
      </div>
    </main>
  );
}
