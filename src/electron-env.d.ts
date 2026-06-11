export {};

declare global {
  interface Window {
    tokenShredderDesktop?: {
      openSettings: () => Promise<void>;
      quit: () => Promise<void>;
      movePetBy: (delta: { x: number; y: number }) => Promise<void>;
      resizePet: (scale: number) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      getMonitorInfo: () => Promise<import('./types').MonitorInfo>;
      configureProvider: (
        config: import('./types').ProviderConfig,
      ) => Promise<import('./types').ConfigureProviderResult>;
      testProvider: (payload: {
        config: import('./types').ProviderConfig;
        prompt: string;
      }) => Promise<import('./types').ProviderTestResult>;
      onUsageEvent: (callback: (event: unknown) => void) => () => void;
      onClearMonitoring: (callback: () => void) => () => void;
    };
  }
}
