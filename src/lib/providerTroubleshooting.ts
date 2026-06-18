import type { ProviderConfig, ProviderTestResult } from '../types';
import { providerMissingFields } from './setupReadiness';

export type ProviderTroubleshootingKind =
  | 'not-tested'
  | 'missing-fields'
  | 'success-with-usage'
  | 'success-without-usage'
  | 'auth'
  | 'model-or-path'
  | 'rate-limit'
  | 'request-shape'
  | 'upstream'
  | 'network'
  | 'unknown';

export interface ProviderTroubleshooting {
  kind: ProviderTroubleshootingKind;
  tone: 'ok' | 'warn' | 'fail' | 'info';
  title: string;
  summary: string;
  steps: string[];
  report: string;
}

interface ProviderTroubleshootingInput {
  result: ProviderTestResult | null;
  providerConfig: ProviderConfig;
  proxyBaseUrl: string;
}

const normalizeError = (error: string | undefined) => (error ?? '').toLowerCase();

const hasAny = (value: string, patterns: string[]) => patterns.some((pattern) => value.includes(pattern));

const kindFromResult = (
  result: ProviderTestResult | null,
  missingFields: string[],
): ProviderTroubleshootingKind => {
  if (!result) {
    return 'not-tested';
  }

  if (missingFields.length > 0) {
    return 'missing-fields';
  }

  if (result.ok && result.usageEvent) {
    return 'success-with-usage';
  }

  if (result.ok) {
    return 'success-without-usage';
  }

  const error = normalizeError(result.error);

  if (result.status === 401 || result.status === 403 || hasAny(error, ['unauthorized', 'forbidden', 'api key', 'apikey', '鉴权', '认证', '权限'])) {
    return 'auth';
  }

  if (result.status === 404 || hasAny(error, ['not found', 'model', 'endpoint', 'deployment', '模型', '接入点', '不存在'])) {
    return 'model-or-path';
  }

  if (result.status === 429 || hasAny(error, ['rate limit', 'too many', 'quota', '限流', '额度'])) {
    return 'rate-limit';
  }

  if (result.status === 400 || hasAny(error, ['bad request', 'invalid request', 'invalid', '参数'])) {
    return 'request-shape';
  }

  if (typeof result.status === 'number' && result.status >= 500) {
    return 'upstream';
  }

  if (hasAny(error, ['fetch failed', 'enotfound', 'econnrefused', 'timeout', 'network', 'dns', '证书', '连接'])) {
    return 'network';
  }

  return 'unknown';
};

const troubleshootingCopy: Record<
  ProviderTroubleshootingKind,
  Omit<ProviderTroubleshooting, 'kind' | 'report'>
> = {
  'not-tested': {
    tone: 'info',
    title: '还没有发送测试请求',
    summary: '填完必要字段后，点击“发送测试请求”，这里会给出更具体的排查建议。',
    steps: ['确认本地服务运行中', '确认 API Key、Base URL、模型 / 接入点 ID 已填写', '点击“发送测试请求”'],
  },
  'missing-fields': {
    tone: 'warn',
    title: '先补齐必要字段',
    summary: '本机代理至少需要 API Key、上游 Base URL、模型 / 接入点 ID。',
    steps: ['按后台提示补齐缺失字段', '如果只想 POST /usage，可以不用填写 API Key', '补齐后再发送测试请求'],
  },
  'success-with-usage': {
    tone: 'ok',
    title: '连接成功，并且收到 usage',
    summary: '这是最理想的状态。宠物应该会根据上游返回的 usage 短暂碎钱。',
    steps: ['把你的真实客户端 baseURL 改成本机代理', '保持价格配置为你的真实估算价格', '正常使用并观察 session 日志'],
  },
  'success-without-usage': {
    tone: 'warn',
    title: '连接成功，但上游没有返回 usage',
    summary: '请求成功了，但 Token Shredder 没拿到 token 数，因此无法自动计算成本。',
    steps: ['检查该 provider 是否在非流式响应里返回 usage', '如果使用 streaming，先改成非 streaming 测试', '也可以让你的代码在任务结束后直接 POST /usage'],
  },
  auth: {
    tone: 'fail',
    title: '看起来是 API Key 或权限问题',
    summary: '上游返回了鉴权或权限相关错误。',
    steps: ['确认 API Key 没有多余空格', '确认 Key 属于当前 provider / region / project', '确认账号有调用该模型的权限', '不要把真实 API Key 粘贴到 issue'],
  },
  'model-or-path': {
    tone: 'fail',
    title: '看起来是模型 ID、接入点或路径问题',
    summary: '上游没有找到请求的模型、deployment、endpoint，或 Base URL 路径不匹配。',
    steps: ['确认上游 Base URL 是否包含正确的 /v1 或 compatible 路径', '确认模型 / 接入点 ID 与控制台完全一致', '如果 provider 使用 deployment 字段，请按它的 OpenAI-compatible 文档填写'],
  },
  'rate-limit': {
    tone: 'warn',
    title: '看起来是限流或额度问题',
    summary: '上游拒绝请求可能是因为 rate limit、quota、余额或套餐限制。',
    steps: ['稍等一会儿再测试', '检查 provider 控制台余额 / quota / rate limit', '减少测试请求频率或换更低成本模型'],
  },
  'request-shape': {
    tone: 'fail',
    title: '看起来是请求格式问题',
    summary: '上游认为请求参数不合法。不同 provider 的 OpenAI-compatible 细节可能不同。',
    steps: ['确认该 provider 支持 /chat/completions', '确认模型字段名称和值正确', '确认它支持 messages、max_tokens 和非 streaming 请求'],
  },
  upstream: {
    tone: 'warn',
    title: '看起来是上游服务异常',
    summary: 'Token Shredder 已经把请求转发出去了，但上游返回 5xx。',
    steps: ['稍后重试', '检查 provider 状态页或控制台', '如果持续失败，复制排查报告到 issue，但不要包含 API Key'],
  },
  network: {
    tone: 'fail',
    title: '看起来是网络或 Base URL 无法访问',
    summary: '本机代理无法连接到上游服务。',
    steps: ['确认 Base URL 拼写正确', '确认网络、代理、DNS 或证书没有拦截请求', '用 curl 直接访问上游 Base URL 做一次最小验证'],
  },
  unknown: {
    tone: 'fail',
    title: '测试失败，但原因还不明确',
    summary: '复制下面的无密钥排查报告到 issue，或者先对照 provider 文档检查 Base URL、模型 ID 和权限。',
    steps: ['确认必要字段正确', '确认 provider 支持 OpenAI-compatible 非流式 chat completions', '复制排查报告到 issue，注意不要附上 API Key'],
  },
};

const buildReport = ({
  kind,
  result,
  providerConfig,
  proxyBaseUrl,
  missingFields,
}: ProviderTroubleshootingInput & {
  kind: ProviderTroubleshootingKind;
  missingFields: string[];
}) =>
  [
    'Token Shredder provider troubleshooting report',
    `Kind: ${kind}`,
    `Provider: ${providerConfig.providerId}`,
    `Proxy Base URL: ${proxyBaseUrl}`,
    `Upstream Base URL: ${providerConfig.upstreamBaseUrl || '(empty)'}`,
    `Model / endpoint: ${providerConfig.model || '(empty)'}`,
    `Missing fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'none'}`,
    `HTTP status: ${result?.status ?? 'none'}`,
    `Result ok: ${result?.ok ?? false}`,
    `Usage received: ${result?.usageEvent ? 'yes' : 'no'}`,
    `Error: ${result?.error ?? 'none'}`,
    '',
    'Privacy note: this report intentionally excludes API keys, Authorization headers, prompts, completions, messages, and request bodies.',
  ].join('\n');

export const createProviderTroubleshooting = ({
  result,
  providerConfig,
  proxyBaseUrl,
}: ProviderTroubleshootingInput): ProviderTroubleshooting => {
  const missingFields = providerMissingFields(providerConfig);
  const kind = kindFromResult(result, missingFields);
  const copy = troubleshootingCopy[kind];

  return {
    kind,
    ...copy,
    report: buildReport({
      kind,
      result,
      providerConfig,
      proxyBaseUrl,
      missingFields,
    }),
  };
};
