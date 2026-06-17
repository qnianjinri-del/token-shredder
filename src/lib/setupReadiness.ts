import type {
  AppState,
  MonitorInfo,
  PetRuntimeState,
  ProviderConfig,
  UsageEvent,
} from '../types';
import { QUICK_START_SCENARIO_NAME } from './quickStart';

export type SetupReadinessStatus =
  | 'collector-unavailable'
  | 'try-demo'
  | 'choose-integration'
  | 'proxy-ready'
  | 'real-monitoring';

export type SetupPrimaryAction = 'quick-demo' | 'collector-test' | 'provider-test' | 'none';

export interface SetupReadinessCheck {
  label: string;
  detail: string;
  done: boolean;
}

export interface SetupReadiness {
  status: SetupReadinessStatus;
  title: string;
  message: string;
  primaryLabel: string;
  primaryAction: SetupPrimaryAction;
  primaryHref?: string;
  tone: 'ok' | 'warn' | 'info';
  providerMissingFields: string[];
  hasAnyUsage: boolean;
  hasRealUsage: boolean;
  completedChecks: number;
  totalChecks: number;
  checks: SetupReadinessCheck[];
}

export const providerMissingFields = (providerConfig: ProviderConfig): string[] =>
  [
    providerConfig.apiKey.trim() ? '' : 'API Key',
    providerConfig.upstreamBaseUrl.trim() ? '' : '上游 Base URL',
    providerConfig.model.trim() ? '' : '模型 / 接入点 ID',
  ].filter(Boolean);

export const isQuickStartUsageEvent = (event: UsageEvent): boolean =>
  event.id.startsWith('quick-start-') ||
  event.source === '本地一键试玩' ||
  event.scenarioName === QUICK_START_SCENARIO_NAME;

export const hasUsablePricing = (state: AppState): boolean =>
  state.pricing.inputPricePerMillion > 0 ||
  state.pricing.outputPricePerMillion > 0 ||
  state.pricing.cachedInputPricePerMillion > 0 ||
  state.pricing.reasoningPricePerMillion > 0;

export const deriveSetupReadiness = ({
  state,
  monitorInfo,
  providerConfig,
  runtimeState,
}: {
  state: AppState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  runtimeState: PetRuntimeState;
}): SetupReadiness => {
  const providerMissing = providerMissingFields(providerConfig);
  const providerBasicsReady = providerMissing.length === 0;
  const collectorRunning = monitorInfo.status === 'running' && Boolean(monitorInfo.usageUrl);
  const hasAnyUsage = state.monitoring.events.length > 0;
  const hasRealUsage = state.monitoring.events.some((event) => !isQuickStartUsageEvent(event));
  const pricingReady = hasUsablePricing(state);

  const checks: SetupReadinessCheck[] = [
    {
      label: '本地服务',
      detail: collectorRunning ? monitorInfo.usageUrl : monitorInfo.error || 'collector 还没有启动完成',
      done: collectorRunning,
    },
    {
      label: '价格',
      detail: pricingReady ? '已有可用于估算的价格' : '请至少填写一种 token 价格',
      done: pricingReady,
    },
    {
      label: '宠物状态',
      detail: runtimeState === 'empty' ? '等待真实 usage 或手动试玩' : '宠物运行状态正常',
      done: runtimeState !== 'empty' || hasAnyUsage,
    },
    {
      label: '本机代理必填项',
      detail: providerBasicsReady ? 'API Key、Base URL、模型 ID 已填写' : `还差：${providerMissing.join('、')}`,
      done: providerBasicsReady,
    },
    {
      label: '真实 usage',
      detail: hasRealUsage ? '已经收到真实 usage' : hasAnyUsage ? '目前只有本地试玩 usage' : '还没有 usage',
      done: hasRealUsage,
    },
  ];

  const completedChecks = checks.filter((check) => check.done).length;
  const base = {
    providerMissingFields: providerMissing,
    hasAnyUsage,
    hasRealUsage,
    completedChecks,
    totalChecks: checks.length,
    checks,
  };

  if (!collectorRunning) {
    return {
      ...base,
      status: 'collector-unavailable',
      title: '先等本地服务启动',
      message: '本机 collector 还不可用。等后台显示运行中后，再试玩或接入真实 usage。',
      primaryLabel: '查看问题诊断',
      primaryAction: 'none',
      primaryHref: '#diagnostics',
      tone: 'warn',
    };
  }

  if (hasRealUsage) {
    return {
      ...base,
      status: 'real-monitoring',
      title: '已经在真实监控',
      message: '桌面宠物会停在当前真实成本进度，下一次 usage 到来时再继续碎钱。',
      primaryLabel: '复制诊断信息',
      primaryAction: 'none',
      primaryHref: '#diagnostics',
      tone: 'ok',
    };
  }

  if (providerConfig.enabled && providerBasicsReady) {
    return {
      ...base,
      status: 'proxy-ready',
      title: '本机代理已准备好',
      message: '下一步发送一次最小测试请求。如果上游返回 usage，宠物会按真实成本动一下。',
      primaryLabel: '测试本机代理',
      primaryAction: 'provider-test',
      primaryHref: '#provider-setup',
      tone: 'ok',
    };
  }

  if (hasAnyUsage) {
    return {
      ...base,
      status: 'choose-integration',
      title: '试玩成功，接下来接真实 usage',
      message: providerBasicsReady
        ? '必要字段已经填好，可以启用本机代理；也可以直接把 usage POST 到本机接口。'
        : '如果你有 API Key，就补齐本机代理字段；如果你的脚本已有 usage 数字，直接复制 POST 示例即可。',
      primaryLabel: providerBasicsReady ? '去启用本机代理' : '填写接入信息',
      primaryAction: 'none',
      primaryHref: providerBasicsReady ? '#provider-setup' : '#start-here',
      tone: 'info',
    };
  }

  return {
    ...base,
    status: 'try-demo',
    title: '第一步：先让宠物动一次',
    message: '不用 API Key，先发一条本机模拟 usage，确认桌面宠物、价格计算和动画链路都正常。',
    primaryLabel: '一键试玩',
    primaryAction: 'quick-demo',
    primaryHref: '#start-here',
    tone: 'info',
  };
};

export const setupReadinessSummary = (readiness: SetupReadiness): string =>
  [
    `Setup readiness: ${readiness.title}`,
    `Status: ${readiness.status}`,
    `Checks: ${readiness.completedChecks}/${readiness.totalChecks}`,
    `Has real usage: ${readiness.hasRealUsage ? 'yes' : 'no'}`,
    `Provider missing fields: ${
      readiness.providerMissingFields.length > 0 ? readiness.providerMissingFields.join(', ') : 'none'
    }`,
  ].join('\n');
