import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { MoneyShredder } from './components/MoneyShredder';
import { PetWindow } from './components/PetWindow';
import { SettingsWindow } from './components/SettingsWindow';
import { SetupPanel } from './components/SetupPanel';
import { calculateCost } from './lib/cost';
import { createRandomDemo } from './lib/demo';
import { CUSTOM_PRESET_ID, DEFAULT_STATE, applyPresetToState } from './lib/presets';
import {
  clearProviderConfig,
  loadProviderConfig,
  saveProviderConfig,
} from './lib/providerConfig';
import { createQuickStartUsageEvent } from './lib/quickStart';
import { clearStoredState, loadStoredState, saveStoredState } from './lib/storage';
import { readStateFromUrl } from './lib/urlState';
import { clampPetScale } from './lib/pet';
import { derivePetRuntimeState } from './lib/runtime';
import type {
  AppState,
  CostMode,
  DemoMode,
  MonitorInfo,
  Pricing,
  ProviderConfig,
  ProviderTestResult,
  PetSkinId,
  TokenUsage,
  UsageEvent,
} from './types';

type WindowMode = 'pet' | 'settings' | 'browser';

const getWindowMode = (): WindowMode => {
  if (typeof window === 'undefined') {
    return 'browser';
  }

  const mode = new URLSearchParams(window.location.search).get('window');
  if (mode === 'pet' || mode === 'settings') {
    return mode;
  }

  return 'browser';
};

const getInitialState = (): AppState => {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  const storedState = loadStoredState() ?? DEFAULT_STATE;
  return readStateFromUrl(storedState) ?? storedState;
};

const fallbackMonitorInfo: MonitorInfo = {
  host: '127.0.0.1',
  port: 17391,
  preferredPort: 17391,
  preferredPortAvailable: true,
  usageUrl: 'http://127.0.0.1:17391/usage',
  healthUrl: 'http://127.0.0.1:17391/health',
  status: 'starting',
  receivedUsageEvents: 0,
  codexMonitor: {
    enabled: true,
    status: 'missing',
    sessionsPath: '',
  },
};

const isUsageEvent = (value: unknown): value is UsageEvent => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const event = value as Partial<UsageEvent>;
  return (
    typeof event.id === 'string' &&
    typeof event.timestamp === 'number' &&
    typeof event.source === 'string' &&
    typeof event.scenarioName === 'string' &&
    typeof event.inputTokens === 'number' &&
    typeof event.outputTokens === 'number' &&
    typeof event.cachedInputTokens === 'number' &&
    typeof event.reasoningTokens === 'number' &&
    typeof event.directCost === 'number'
  );
};

const appendUsageEvent = (state: AppState, event: UsageEvent): AppState => {
  if (state.monitoring.events.some((existing) => existing.id === event.id)) {
    return state;
  }

  const hasExistingMonitorSession = state.monitoring.events.length > 0;
  const baseUsage = hasExistingMonitorSession
    ? state.usage
    : {
        ...state.usage,
        inputTokens: 0,
        outputTokens: 0,
        cachedInputTokens: 0,
        reasoningTokens: 0,
      };

  return {
    ...state,
    scenarioName: event.scenarioName || state.scenarioName,
    costMode: 'token-usage',
    usage: {
      ...baseUsage,
      inputTokens: baseUsage.inputTokens + event.inputTokens,
      outputTokens: baseUsage.outputTokens + event.outputTokens,
      cachedInputTokens: baseUsage.cachedInputTokens + event.cachedInputTokens,
      reasoningTokens: baseUsage.reasoningTokens + event.reasoningTokens,
      numberOfRuns: 1,
      runsPerDay: 0,
      daysPerMonth: 30,
    },
    monitoring: {
      directCostTotal: state.monitoring.directCostTotal + event.directCost,
      events: [event, ...state.monitoring.events].slice(0, 100),
    },
  };
};

const clearMonitoringState = (state: AppState): AppState => ({
  ...state,
  scenarioName: DEFAULT_STATE.scenarioName,
  usage: {
    ...state.usage,
    inputTokens: 0,
    outputTokens: 0,
    cachedInputTokens: 0,
    reasoningTokens: 0,
    numberOfRuns: 1,
    runsPerDay: 0,
    daysPerMonth: 30,
  },
  directCost: 0,
  monitoring: {
    events: [],
    directCostTotal: 0,
  },
});

function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(() => loadProviderConfig());
  const [monitorInfo, setMonitorInfo] = useState<MonitorInfo>(fallbackMonitorInfo);
  const [activeUntil, setActiveUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [setupOpen, setSetupOpen] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const windowMode = useMemo(getWindowMode, []);
  const result = useMemo(() => calculateCost(state), [state]);
  const runtimeState = useMemo(
    () =>
      derivePetRuntimeState({
        demoMode: state.demoMode,
        hasUsageEvents: state.monitoring.events.length > 0,
        isReceivingUsage: now < activeUntil,
      }),
    [activeUntil, now, state.demoMode, state.monitoring.events.length],
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.style.colorScheme = state.theme;
  }, [state.theme]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel('token-shredder-state');
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<AppState>) => {
      if (event.data && typeof event.data === 'object') {
        setState({ ...event.data, visualMode: 'money-shredder' });
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 800);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    void window.tokenShredderDesktop?.getMonitorInfo().then(setMonitorInfo);
  }, []);

  useEffect(() => {
    if (windowMode !== 'pet' || state.onboardingComplete) {
      return;
    }

    void window.tokenShredderDesktop?.openSettings();
  }, [state.onboardingComplete, windowMode]);

  useEffect(() => {
    const unsubscribe = window.tokenShredderDesktop?.onUsageEvent((event) => {
      if (!isUsageEvent(event)) {
        return;
      }

      setActiveUntil(Date.now() + 1_400);
      setMonitorInfo((current) => ({
        ...current,
        receivedUsageEvents: current.receivedUsageEvents + 1,
        codexMonitor: event.codexRateLimits
          ? {
              ...(current.codexMonitor ?? {
                enabled: true,
                status: 'watching' as const,
                sessionsPath: '',
              }),
              enabled: true,
              status: 'watching' as const,
              lastTokenEventAt: event.timestamp,
              rateLimits: event.codexRateLimits,
            }
          : current.codexMonitor,
      }));
      setState((current) => appendUsageEvent(current, event));
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const unsubscribe = window.tokenShredderDesktop?.onClearMonitoring(() => {
      setActiveUntil(0);
      setMonitorInfo((current) => ({
        ...current,
        receivedUsageEvents: 0,
      }));
      setState((current) => clearMonitoringState(current));
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    const nextState = { ...state, visualMode: 'money-shredder' as const };
    saveStoredState(nextState);
    channelRef.current?.postMessage(nextState);
  }, [state]);

  useEffect(() => {
    saveProviderConfig(providerConfig);
  }, [providerConfig]);

  useEffect(() => {
    if (!providerConfig.enabled || !providerConfig.apiKey || !window.tokenShredderDesktop?.configureProvider) {
      return;
    }

    void window.tokenShredderDesktop.configureProvider(providerConfig);
  }, [providerConfig]);

  const updateUsage = (patch: Partial<TokenUsage>) => {
    setState((current) => ({
      ...current,
      usage: { ...current.usage, ...patch },
    }));
  };

  const updatePricing = (pricing: Pricing) => {
    setState((current) => ({
      ...current,
      presetId: CUSTOM_PRESET_ID,
      pricing,
    }));
  };

  const setCostMode = (costMode: CostMode) => {
    setState((current) => ({ ...current, costMode }));
  };

  const reset = () => {
    clearStoredState();
    clearProviderConfig();
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
    setState(DEFAULT_STATE);
    setProviderConfig(loadProviderConfig());
  };

  const clearMonitoring = () => {
    if (monitorInfo.status === 'running' && monitorInfo.usageUrl) {
      void fetch(monitorInfo.usageUrl, { method: 'DELETE' }).catch(() => undefined);
    }

    setState((current) => clearMonitoringState(current));
    setMonitorInfo((current) => ({
      ...current,
      receivedUsageEvents: 0,
    }));
    setActiveUntil(0);
  };

  const sendTestUsageEvent = async () => {
    if (monitorInfo.status !== 'running' || !monitorInfo.usageUrl) {
      throw new Error('Local usage collector is not running.');
    }

    const response = await fetch(monitorInfo.usageUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'Token Shredder test',
        scenarioName: '实时监控测试',
        inputTokens: 82_000,
        outputTokens: 19_500,
        cachedInputTokens: 24_000,
        reasoningTokens: 3_200,
      }),
    });

    if (!response.ok) {
      throw new Error('Local usage collector rejected the test usage event.');
    }
  };

  const runQuickStartDemo = () => {
    const event = createQuickStartUsageEvent();
    setActiveUntil(Date.now() + 1_400);
    setMonitorInfo((current) => ({
      ...current,
      receivedUsageEvents: current.receivedUsageEvents + 1,
    }));
    setState((current) =>
      appendUsageEvent(
        {
          ...current,
          onboardingComplete: true,
          demoMode: 'auto',
        },
        event,
      ),
    );
  };

  const toggleTheme = () => {
    setState((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }));
  };

  const setDemoMode = (demoMode: DemoMode) => {
    setState((current) => ({ ...current, demoMode }));
  };

  const setPetSkin = (petSkin: PetSkinId) => {
    setState((current) => ({ ...current, petSkin }));
  };

  const completeOnboarding = () => {
    setState((current) => ({ ...current, onboardingComplete: true }));
  };

  const reopenOnboarding = () => {
    setState((current) => ({ ...current, onboardingComplete: false }));
  };

  const configureProvider = async (config: ProviderConfig) => {
    if (!window.tokenShredderDesktop?.configureProvider) {
      return {
        ok: false,
        error: '当前不是 Electron 桌面环境，无法启用本机代理。',
      };
    }

    const result = await window.tokenShredderDesktop.configureProvider(config);
    setProviderConfig({ ...config, enabled: result.ok });
    return result;
  };

  const testProvider = async (config: ProviderConfig, prompt: string): Promise<ProviderTestResult> => {
    if (!window.tokenShredderDesktop?.testProvider) {
      return {
        ok: false,
        error: '当前不是 Electron 桌面环境，无法测试本机代理。',
      };
    }

    const result = await window.tokenShredderDesktop.testProvider({ config, prompt });
    setProviderConfig({ ...config, enabled: result.ok });
    return result;
  };

  const settingsProps = {
    state: { ...state, visualMode: 'money-shredder' as const },
    result,
    runtimeState,
    monitorInfo,
    providerConfig,
    onCostModeChange: setCostMode,
    onScenarioNameChange: (scenarioName: string) => setState((current) => ({ ...current, scenarioName })),
    onUsageChange: updateUsage,
    onPricingChange: updatePricing,
    onPresetChange: (presetId: string) => setState((current) => applyPresetToState(current, presetId)),
    onProviderConfigChange: setProviderConfig,
    onConfigureProvider: configureProvider,
    onTestProvider: testProvider,
    onDirectCostChange: (directCost: number) => setState((current) => ({ ...current, directCost })),
    onPetScaleChange: (petScale: number) => setState((current) => ({ ...current, petScale: clampPetScale(petScale) })),
    onPetSkinChange: setPetSkin,
    onReset: reset,
    onRandomDemo: () => setState((current) => createRandomDemo({ ...current, visualMode: 'money-shredder' })),
    onClearMonitoring: clearMonitoring,
    onSendTestUsageEvent: sendTestUsageEvent,
    onRunQuickStartDemo: runQuickStartDemo,
    onDemoModeChange: setDemoMode,
    onCompleteOnboarding: completeOnboarding,
    onReopenOnboarding: reopenOnboarding,
  };

  if (windowMode === 'pet') {
    return (
      <PetWindow
        scenarioName={state.scenarioName}
        result={result}
        petScale={state.petScale}
        petSkin={state.petSkin}
        demoLoop={runtimeState === 'demo'}
      />
    );
  }

  if (windowMode === 'settings') {
    return <SettingsWindow {...settingsProps} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f0d7] text-slate-950 transition-colors dark:bg-[#101522] dark:text-white">
      <div className="pixel-grid-bg pointer-events-none fixed inset-0" />
      <div className="relative">
        <Header theme={state.theme} onOpenSetup={() => setSetupOpen(true)} onToggleTheme={toggleTheme} />
        <MoneyShredder
          result={result}
          scenarioName={state.scenarioName}
          petSkin={state.petSkin}
        />
        <SetupPanel
          isOpen={setupOpen}
          {...settingsProps}
          onClose={() => setSetupOpen(false)}
        />
      </div>
    </div>
  );
}

export default App;
