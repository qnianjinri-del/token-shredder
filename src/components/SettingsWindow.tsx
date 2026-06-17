import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { BackupPanel } from './BackupPanel';
import { CostBreakdown } from './CostBreakdown';
import { DemoModePanel } from './DemoModePanel';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { IntegrationRecipesPanel } from './IntegrationRecipesPanel';
import { MonitorPanel } from './MonitorPanel';
import { NextStepPanel } from './NextStepPanel';
import { PetSkinPanel } from './PetSkinPanel';
import { PetSizePanel } from './PetSizePanel';
import { PricingPanel } from './PricingPanel';
import { ProviderSetupPanel } from './ProviderSetupPanel';
import { QuickVerifyPanel } from './QuickVerifyPanel';
import { SharePanel } from './SharePanel';
import { SelfCheckPanel } from './SelfCheckPanel';
import { SessionExportPanel } from './SessionExportPanel';
import { SetupChecklistPanel } from './SetupChecklistPanel';
import { StatusPanel } from './StatusPanel';
import { StartHerePanel } from './StartHerePanel';
import { ThemeToggle } from './ThemeToggle';

type SettingsTab = 'start' | 'connect' | 'cost' | 'pet' | 'diagnose';

const settingsTabs: Array<{
  id: SettingsTab;
  label: string;
  description: string;
}> = [
  {
    id: 'start',
    label: '开始',
    description: '下一步建议、自动体检、首次接入',
  },
  {
    id: 'connect',
    label: '接入',
    description: 'Provider、本机 API、usage 日志',
  },
  {
    id: 'cost',
    label: '成本',
    description: '价格、明细、分享、导出',
  },
  {
    id: 'pet',
    label: '宠物',
    description: '皮肤、大小、演示模式',
  },
  {
    id: 'diagnose',
    label: '诊断',
    description: '状态、备份、问题报告',
  },
];

const hashTabMap: Record<string, SettingsTab> = {
  'start-here': 'start',
  'self-check': 'start',
  recipes: 'connect',
  'provider-setup': 'connect',
  monitoring: 'connect',
  pricing: 'cost',
  'pet-skins': 'pet',
  backup: 'diagnose',
  diagnostics: 'diagnose',
};

const tabFromHash = (hash: string): SettingsTab | null => {
  const normalized = hash.replace(/^#/, '');
  return hashTabMap[normalized] ?? null;
};

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
  onRestoreConfig: (state: AppState, providerConfig: ProviderConfig) => void;
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
  onRestoreConfig,
  onToggleTheme,
}: SettingsWindowProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(() => tabFromHash(window.location.hash) ?? 'start');

  useEffect(() => {
    const syncHash = () => {
      const nextTab = tabFromHash(window.location.hash);
      if (!nextTab) {
        return;
      }

      setActiveTab(nextTab);
      window.setTimeout(() => {
        document.getElementById(window.location.hash.replace(/^#/, ''))?.scrollIntoView({
          block: 'start',
        });
      }, 0);
    };

    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f0d7] p-4 text-slate-950 dark:bg-[#101522] dark:text-white">
      <div className="pixel-grid-bg pointer-events-none fixed inset-0" />
      <div className="relative mx-auto max-w-6xl space-y-4">
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
            配好价格，把你的 Agent usage 自动发到本机；桌面只保留小宠物。后台已按“开始 / 接入 / 成本 / 宠物 / 诊断”整理。
          </p>
          <a
            href="#start-here"
            onClick={() => {
              setActiveTab('start');
              onReopenOnboarding();
            }}
            className="mt-3 inline-block text-xs font-black text-cyan-700 underline decoration-4 underline-offset-4 dark:text-cyan-200"
          >
            重新查看接入指南
          </a>
        </div>

        <nav className="glass-panel p-3" aria-label="后台分区">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`mode-button min-h-[74px] flex-col items-start justify-center px-3 py-2 text-left ${
                  activeTab === tab.id ? 'mode-button-active' : ''
                }`}
              >
                <span className="text-sm">{tab.label}</span>
                <span className="text-[10px] leading-snug opacity-75">{tab.description}</span>
              </button>
            ))}
          </div>
        </nav>

        {activeTab === 'start' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
              <NextStepPanel
                state={state}
                runtimeState={runtimeState}
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
                onRunQuickStartDemo={onRunQuickStartDemo}
                onSendTestUsageEvent={onSendTestUsageEvent}
                onTestProvider={onTestProvider}
              />

              <StartHerePanel
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
                runtimeState={runtimeState}
                petSkin={state.petSkin}
                usageEventCount={state.monitoring.events.length}
                onboardingComplete={state.onboardingComplete}
                onRunQuickStartDemo={onRunQuickStartDemo}
                onSendTestUsageEvent={onSendTestUsageEvent}
                onCompleteOnboarding={onCompleteOnboarding}
              />

              <QuickVerifyPanel
                monitorInfo={monitorInfo}
                onRunQuickStartDemo={onRunQuickStartDemo}
                onSendTestUsageEvent={onSendTestUsageEvent}
              />
            </div>

            <div className="space-y-4">
              <SelfCheckPanel
                state={state}
                runtimeState={runtimeState}
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
                onSendTestUsageEvent={onSendTestUsageEvent}
              />

              <SetupChecklistPanel
                state={state}
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
              />
            </div>
          </section>
        ) : null}

        {activeTab === 'connect' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-4">
              <ProviderSetupPanel
                providerConfig={providerConfig}
                monitorInfo={monitorInfo}
                onProviderConfigChange={onProviderConfigChange}
                onConfigureProvider={onConfigureProvider}
                onTestProvider={onTestProvider}
                onRunQuickStartDemo={onRunQuickStartDemo}
              />

              <IntegrationRecipesPanel
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
              />
            </div>

            <div className="space-y-4">
              <MonitorPanel
                state={state}
                monitorInfo={monitorInfo}
                onClearMonitoring={onClearMonitoring}
                onSendTestUsageEvent={onSendTestUsageEvent}
              />
            </div>
          </section>
        ) : null}

        {activeTab === 'cost' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-4">
              <CostBreakdown result={result} />
              <PricingPanel
                presetId={state.presetId}
                pricing={state.pricing}
                onPresetChange={onPresetChange}
                onPricingChange={onPricingChange}
              />
            </div>

            <div className="space-y-4">
              <SharePanel state={state} result={result} />
              <SessionExportPanel state={state} result={result} />
            </div>
          </section>
        ) : null}

        {activeTab === 'pet' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <PetSkinPanel petSkin={state.petSkin} onPetSkinChange={onPetSkinChange} />
            </div>

            <div className="space-y-4">
              <PetSizePanel petScale={state.petScale} onPetScaleChange={onPetScaleChange} />
              <DemoModePanel demoMode={state.demoMode} onDemoModeChange={onDemoModeChange} />
            </div>
          </section>
        ) : null}

        {activeTab === 'diagnose' ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-4">
              <StatusPanel
                state={state}
                result={result}
                runtimeState={runtimeState}
                monitorInfo={monitorInfo}
                onClearMonitoring={onClearMonitoring}
                onSendTestUsageEvent={onSendTestUsageEvent}
                onRunQuickStartDemo={onRunQuickStartDemo}
              />

              <DiagnosticsPanel
                state={state}
                result={result}
                runtimeState={runtimeState}
                monitorInfo={monitorInfo}
                providerConfig={providerConfig}
              />
            </div>

            <div className="space-y-4">
              <BackupPanel
                state={state}
                providerConfig={providerConfig}
                onRestore={onRestoreConfig}
              />

              <div className="glass-panel flex flex-wrap gap-2 p-4">
                <button type="button" onClick={onReset} className="action-button">
                  <RotateCcw size={16} />
                  <span>重置全部配置</span>
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
