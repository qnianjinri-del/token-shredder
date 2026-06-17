import type { AppState, MonitorInfo, PetRuntimeState, ProviderConfig } from '../types';
import { runtimeStateLabel } from './runtime';
import {
  deriveSetupReadiness,
  providerMissingFields,
  setupReadinessSummary,
} from './setupReadiness';

export type SelfCheckStatus = 'pass' | 'warn' | 'fail';

export interface SelfCheckItem {
  id: string;
  label: string;
  status: SelfCheckStatus;
  detail: string;
}

export interface SelfCheckInput {
  state: AppState;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}

export const selfCheckStatusLabel: Record<SelfCheckStatus, string> = {
  pass: '通过',
  warn: '提醒',
  fail: '失败',
};

export const selfCheckStatusRank: Record<SelfCheckStatus, number> = {
  pass: 0,
  warn: 1,
  fail: 2,
};

export const summarizeSelfCheckStatus = (items: SelfCheckItem[]): SelfCheckStatus => {
  if (items.some((item) => item.status === 'fail')) {
    return 'fail';
  }

  if (items.some((item) => item.status === 'warn')) {
    return 'warn';
  }

  return 'pass';
};

export const createStaticSelfCheckItems = ({
  state,
  runtimeState,
  monitorInfo,
  providerConfig,
}: SelfCheckInput): SelfCheckItem[] => {
  const missingProviderFields = providerMissingFields(providerConfig);
  const readiness = deriveSetupReadiness({
    state,
    runtimeState,
    monitorInfo,
    providerConfig,
  });

  return [
    {
      id: 'collector-state',
      label: '本地 collector 状态',
      status: monitorInfo.status === 'running' ? 'pass' : 'fail',
      detail:
        monitorInfo.status === 'running'
          ? `运行中：${monitorInfo.usageUrl}`
          : monitorInfo.error || 'collector 未运行。',
    },
    {
      id: 'setup-readiness',
      label: '下一步建议状态',
      status:
        readiness.status === 'collector-unavailable'
          ? 'fail'
          : readiness.status === 'real-monitoring'
            ? 'pass'
            : 'warn',
      detail: `${readiness.title} · ${readiness.completedChecks}/${readiness.totalChecks} 项完成`,
    },
    {
      id: 'pricing',
      label: '价格配置',
      status: readiness.checks.find((check) => check.label === '价格')?.done ? 'pass' : 'warn',
      detail:
        readiness.checks.find((check) => check.label === '价格')?.detail ||
        '价格是可编辑示例值，正式估算前请按实际 provider 填写。',
    },
    {
      id: 'provider-fields',
      label: '本机代理必填项',
      status: missingProviderFields.length === 0 ? 'pass' : 'warn',
      detail:
        missingProviderFields.length === 0
          ? 'API Key、Base URL、模型 / 接入点 ID 已填写。'
          : `还差：${missingProviderFields.join('、')}。直接 POST usage 时可以不填。`,
    },
    {
      id: 'real-usage',
      label: '真实 usage',
      status: readiness.hasRealUsage ? 'pass' : 'warn',
      detail: readiness.hasRealUsage
        ? '已经收到真实 usage，宠物会停在真实成本进度。'
        : '还没有真实 usage。试玩或测试 usage 不代表真实账单。',
    },
    {
      id: 'runtime-state',
      label: '宠物运行状态',
      status: runtimeState === 'empty' ? 'warn' : 'pass',
      detail: runtimeStateLabel[runtimeState],
    },
  ];
};

export const buildSelfCheckReport = ({
  input,
  items,
  generatedAt = new Date(),
}: {
  input: SelfCheckInput;
  items: SelfCheckItem[];
  generatedAt?: Date;
}): string => {
  const readiness = deriveSetupReadiness(input);
  const overall = summarizeSelfCheckStatus(items);

  return [
    'Token Shredder 自动体检报告',
    `Generated: ${generatedAt.toISOString()}`,
    `Overall: ${selfCheckStatusLabel[overall]}`,
    '',
    setupReadinessSummary(readiness),
    '',
    'Checks:',
    ...items
      .slice()
      .sort((a, b) => selfCheckStatusRank[b.status] - selfCheckStatusRank[a.status])
      .map((item) => `- [${selfCheckStatusLabel[item.status]}] ${item.label}: ${item.detail}`),
    '',
    'Privacy note: this report intentionally excludes API keys, Authorization headers, prompt text, completion text, and messages.',
  ].join('\n');
};
