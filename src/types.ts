export type VisualMode = 'money-shredder';

export type PetSkinId = 'shredder' | 'doh-dad' | 'codex-chomp' | 'agent-bot' | 'token-furnace';

export type CostMode = 'token-usage' | 'direct-cost';

export type ThemeMode = 'dark' | 'light';

export type DemoMode = 'auto' | 'always' | 'off';

export type PetRuntimeState = 'demo' | 'empty' | 'active-real' | 'idle-real';

export type ProviderId = 'volcengine-ark' | 'openai-compatible' | 'custom';

export interface Pricing {
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  cachedInputPricePerMillion: number;
  reasoningPricePerMillion: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  numberOfRuns: number;
  runsPerDay: number;
  daysPerMonth: number;
}

export interface UsageEvent {
  id: string;
  timestamp: number;
  source: string;
  scenarioName: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  reasoningTokens: number;
  directCost: number;
  codexRateLimits?: CodexRateLimits;
}

export interface MonitoringState {
  events: UsageEvent[];
  directCostTotal: number;
}

export interface MonitorInfo {
  host: string;
  port: number | null;
  preferredPort: number;
  preferredPortAvailable: boolean;
  usageUrl: string;
  healthUrl: string;
  status: 'starting' | 'running' | 'error';
  error?: string;
  receivedUsageEvents: number;
  codexMonitor?: CodexMonitorInfo;
}

export interface CodexRateLimitWindow {
  usedPercent: number | null;
  windowMinutes: number | null;
  resetsAt: number | null;
}

export interface CodexRateLimits {
  primary: CodexRateLimitWindow | null;
  secondary: CodexRateLimitWindow | null;
}

export interface CodexMonitorInfo {
  enabled: boolean;
  status: 'watching' | 'missing' | 'error';
  sessionsPath: string;
  lastTokenEventAt?: number;
  error?: string;
  rateLimits?: CodexRateLimits;
}

export interface ProviderConfig {
  enabled: boolean;
  providerId: ProviderId;
  upstreamBaseUrl: string;
  apiKey: string;
  model: string;
  saveApiKey: boolean;
  testPrompt: string;
}

export interface ConfigureProviderResult {
  ok: boolean;
  proxyBaseUrl?: string;
  error?: string;
}

export interface ProviderTestResult {
  ok: boolean;
  status?: number;
  proxyBaseUrl?: string;
  content?: string;
  usageEvent?: UsageEvent | null;
  error?: string;
}

export interface AppState {
  scenarioName: string;
  visualMode: VisualMode;
  petSkin: PetSkinId;
  costMode: CostMode;
  presetId: string;
  pricing: Pricing;
  usage: TokenUsage;
  directCost: number;
  monitoring: MonitoringState;
  demoMode: DemoMode;
  onboardingComplete: boolean;
  petScale: number;
  theme: ThemeMode;
}

export interface CalculationResult {
  inputCost: number;
  outputCost: number;
  cachedCost: number;
  reasoningCost: number;
  costPerRun: number;
  totalCost: number;
  dailyCost: number;
  monthlyCost: number;
  destroyedBills: number;
  currentBillProgress: number;
  currentBillProgressPercent: number;
  summarySentence: string;
}

export interface Preset extends Pricing {
  id: string;
  name: string;
  defaultInputTokens: number;
  defaultOutputTokens: number;
  defaultCachedInputTokens: number;
  defaultReasoningTokens: number;
}
