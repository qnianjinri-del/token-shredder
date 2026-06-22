import type { AppState, MonitorInfo, ProviderConfig } from '../types';
import { hasUsablePricing, isQuickStartUsageEvent, providerMissingFields } from './setupReadiness';

export type SetupPathId = 'quick-demo' | 'provider-proxy' | 'direct-usage' | 'codex-monitor';

export interface SetupPathRequirement {
  label: string;
  detail: string;
  done: boolean;
}

export interface SetupPathStep {
  label: string;
  detail: string;
  href?: string;
}

export interface SetupPath {
  id: SetupPathId;
  title: string;
  badge: string;
  summary: string;
  bestFor: string;
  primaryLabel: string;
  primaryHref?: string;
  requiredInfo: SetupPathRequirement[];
  steps: SetupPathStep[];
  privacyNote: string;
  doneCount: number;
  totalCount: number;
}

const collectorReady = (monitorInfo: MonitorInfo) => monitorInfo.status === 'running' && Boolean(monitorInfo.usageUrl);

const proxyBaseUrl = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : '等待本地服务启动';

const usageUrl = (monitorInfo: MonitorInfo) => monitorInfo.usageUrl || '等待本地服务启动';

const hasRealUsage = (state: AppState) =>
  state.monitoring.events.some((event) => !isQuickStartUsageEvent(event));

const withCounts = (path: Omit<SetupPath, 'doneCount' | 'totalCount'>): SetupPath => {
  const totalCount = path.requiredInfo.length;
  const doneCount = path.requiredInfo.filter((item) => item.done).length;

  return {
    ...path,
    doneCount,
    totalCount,
  };
};

export const buildSetupPaths = ({
  state,
  monitorInfo,
  providerConfig,
}: {
  state: AppState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}): SetupPath[] => {
  const providerMissing = providerMissingFields(providerConfig);
  const providerBasicsReady = providerMissing.length === 0;
  const pricingReady = hasUsablePricing(state);
  const realUsageReady = hasRealUsage(state);
  const usageEndpoint = usageUrl(monitorInfo);
  const localProxyBaseUrl = proxyBaseUrl(monitorInfo);
  const codexMonitor = monitorInfo.codexMonitor;
  const codexWatching = codexMonitor?.status === 'watching';
  const codexHasTokenEvent = typeof codexMonitor?.lastTokenEventAt === 'number';

  return [
    withCounts({
      id: 'quick-demo',
      title: '先看效果',
      badge: '无需 API Key',
      summary: '写入一条本机模拟 usage，让宠物碎一次钱，然后停在结果上。',
      bestFor: '第一次打开、只想确认桌面宠物能不能动。',
      primaryLabel: '一键试玩',
      requiredInfo: [
        {
          label: '本地服务',
          detail: collectorReady(monitorInfo) ? usageEndpoint : monitorInfo.error || '等待 collector 启动',
          done: collectorReady(monitorInfo),
        },
        {
          label: 'API Key',
          detail: '不需要',
          done: true,
        },
        {
          label: '价格',
          detail: pricingReady ? '已有可编辑示例价格' : '请至少保留一种价格用于估算',
          done: pricingReady,
        },
      ],
      steps: [
        { label: '点击一键试玩', detail: '不会请求任何模型，也不代表真实账单。' },
        { label: '观察桌面宠物', detail: '宠物会碎一次钱，并停在当前进度。' },
        { label: '决定真实接入方式', detail: '有 API Key 走本机代理；已有 usage 数字就直接 POST。' },
      ],
      privacyNote: '试玩只产生本机模拟 usage，不会上传数据，也不会读取 API Key。',
    }),
    withCounts({
      id: 'provider-proxy',
      title: '我有 API Key',
      badge: '改 baseURL',
      summary: `把 OpenAI-compatible 客户端指向 ${localProxyBaseUrl}，Token Shredder 从上游响应里提取 usage。`,
      bestFor: '你有 provider API Key，希望尽量少改现有 OpenAI SDK 代码。',
      primaryLabel: providerBasicsReady ? '去测试代理' : '去填写必要信息',
      primaryHref: '#provider-setup',
      requiredInfo: [
        {
          label: 'API Key',
          detail: providerConfig.apiKey.trim() ? '已填写' : '必填，默认只保存在本机',
          done: Boolean(providerConfig.apiKey.trim()),
        },
        {
          label: '上游 Base URL',
          detail: providerConfig.upstreamBaseUrl.trim() || '必填，例如 provider 的 OpenAI-compatible endpoint',
          done: Boolean(providerConfig.upstreamBaseUrl.trim()),
        },
        {
          label: '模型 / 接入点 ID',
          detail: providerConfig.model.trim() || '必填，来自你的 provider 控制台',
          done: Boolean(providerConfig.model.trim()),
        },
        {
          label: '价格',
          detail: pricingReady ? '已有可编辑估算价格' : '请在成本页按实际模型填写',
          done: pricingReady,
        },
      ],
      steps: [
        { label: '填必要信息', detail: providerMissing.length > 0 ? `还差：${providerMissing.join('、')}` : '必要字段已填写。', href: '#provider-setup' },
        { label: '确认价格', detail: '价格是 editable sample values，不是官方实时价格。', href: '#pricing' },
        { label: '保存并测试', detail: '如果上游返回 usage，桌面宠物会按真实成本动一下。', href: '#provider-setup' },
        { label: '修改客户端 baseURL', detail: localProxyBaseUrl },
      ],
      privacyNote: '代理请求会转发到你的上游服务，但后台不写入 prompt、completion、messages、API Key 或 Authorization header。',
    }),
    withCounts({
      id: 'direct-usage',
      title: '我的项目已有 usage',
      badge: 'POST /usage',
      summary: `让脚本、Agent 或 SDK wrapper 把 token 数字发到 ${usageEndpoint}。`,
      bestFor: '你能从模型响应里拿到 usage，或者愿意在项目里加一小段 reporter helper。',
      primaryLabel: '复制接入示例',
      primaryHref: '#recipes',
      requiredInfo: [
        {
          label: '本地服务',
          detail: collectorReady(monitorInfo) ? usageEndpoint : monitorInfo.error || '等待 collector 启动',
          done: collectorReady(monitorInfo),
        },
        {
          label: 'usage 数字',
          detail: '需要 input/output/cached/reasoning tokens，缺失字段可填 0',
          done: realUsageReady,
        },
        {
          label: 'API Key',
          detail: '不需要交给 Token Shredder',
          done: true,
        },
        {
          label: '价格',
          detail: pricingReady ? '已有可编辑估算价格' : '请在成本页按实际模型填写',
          done: pricingReady,
        },
      ],
      steps: [
        { label: '复制 curl / JS / Python 示例', detail: '后台会自动使用实际端口。', href: '#recipes' },
        { label: '在模型响应后上报 usage', detail: 'OpenAI-style usage 需要把 cached tokens 从普通 input 中扣除。' },
        { label: '发送一条真实 usage', detail: '收到后宠物会短暂运行，然后停在真实美元进度。' },
      ],
      privacyNote: '只发送 usage 数字、source、scenarioName 和可选 directCost；不要发送 prompt、completion、messages 或 API Key。',
    }),
    withCounts({
      id: 'codex-monitor',
      title: '我想看 Codex 消耗',
      badge: '本机 watcher',
      summary: 'Token Shredder 会尝试读取本机 Codex session 里的新 token_count 事件。',
      bestFor: '你主要用 Codex Desktop / CLI，希望新 token_count 出现时宠物自动动一下。',
      primaryLabel: '查看监控状态',
      primaryHref: '#monitoring',
      requiredInfo: [
        {
          label: 'Codex session 路径',
          detail: codexMonitor?.sessionsPath || '~/.codex/sessions',
          done: codexWatching,
        },
        {
          label: '新 token_count',
          detail: codexHasTokenEvent ? '已看到新事件' : '打开 Token Shredder 后等待 Codex 产生新事件',
          done: codexHasTokenEvent,
        },
        {
          label: 'API Key',
          detail: '不需要',
          done: true,
        },
        {
          label: '价格',
          detail: pricingReady ? '已有可编辑估算价格' : '请在成本页按实际模型填写',
          done: pricingReady,
        },
      ],
      steps: [
        { label: '确认 watcher 状态', detail: codexWatching ? '正在监听新 token_count。' : '如果没有发现路径，请先启动/使用 Codex。', href: '#monitoring' },
        { label: '让 Codex 产生一次新 usage', detail: '不会回放旧历史，只监听 App 启动后的新事件。' },
        { label: '查看额度字段', detail: '只有 Codex 本地事件里写了 rate limit 信息时才会显示，不等同官方账单。' },
      ],
      privacyNote: 'Codex watcher 只读取 token_count 相关数字，不读取 prompt、completion 或消息内容。',
    }),
  ];
};

export const suggestSetupPathId = ({
  state,
  monitorInfo,
  providerConfig,
}: {
  state: AppState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}): SetupPathId => {
  if (hasRealUsage(state)) {
    return 'direct-usage';
  }

  if (providerMissingFields(providerConfig).length === 0) {
    return 'provider-proxy';
  }

  if (monitorInfo.codexMonitor?.status === 'watching') {
    return 'codex-monitor';
  }

  return 'quick-demo';
};
