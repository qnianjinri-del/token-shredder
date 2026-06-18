import type { ProviderId } from '../types';

export interface ProviderTemplate {
  id: ProviderId;
  label: string;
  shortLabel: string;
  baseUrl: string;
  helper: string;
  apiKeyHint: string;
  modelHint: string;
  pricingHint: string;
  setupSteps: string[];
}

export const PROVIDER_TEMPLATES: ProviderTemplate[] = [
  {
    id: 'volcengine-ark',
    label: '火山方舟 / OpenAI-compatible（可编辑示例）',
    shortLabel: '火山方舟',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    helper: '适合已有火山引擎方舟 API Key 的用户。下面的 Base URL 是可编辑示例，请以你的控制台为准。',
    apiKeyHint: '粘贴你的火山方舟 API Key；不会写入 usage 日志。',
    modelHint: '填写你在控制台创建或使用的模型 / 接入点 ID。',
    pricingHint: '价格请按你实际使用的模型或合同填写，不代表官方实时价格。',
    setupSteps: ['准备 API Key', '确认上游 Base URL', '复制模型 / 接入点 ID', '填写可编辑 token 价格', '点击“保存并启用”后发送测试请求'],
  },
  {
    id: 'openai-compatible',
    label: '通用 OpenAI-compatible（可编辑示例）',
    shortLabel: '通用兼容',
    baseUrl: 'https://api.openai.com/v1',
    helper: '适合任何兼容 OpenAI SDK 的服务商。Base URL、模型名和价格都需要你按实际服务修改。',
    apiKeyHint: '粘贴你的上游 provider API Key；如果客户端自己带 Authorization，也可以不保存。',
    modelHint: '填写服务商要求的 model / deployment / endpoint 字段。',
    pricingHint: '示例价格不会自动更新，请用 provider 文档、控制台或合同中的价格。',
    setupSteps: ['确认服务商支持 OpenAI-compatible API', '填上游 Base URL', '填模型或 endpoint', '填 token 价格', '把客户端 baseURL 改成本机代理'],
  },
  {
    id: 'deepseek-compatible',
    label: 'DeepSeek-compatible（可编辑示例）',
    shortLabel: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    helper: '常见 DeepSeek-compatible 接入模板。请按你账号后台或文档确认 Base URL 和模型名。',
    apiKeyHint: '粘贴你的 DeepSeek-compatible API Key。',
    modelHint: '填写你的模型名，例如你实际使用的 chat/reasoner 模型 ID。',
    pricingHint: '如果模型区分 reasoning / output，请把价格拆到对应字段。',
    setupSteps: ['确认 Base URL', '确认模型名', '填写 API Key', '填写 input / output / reasoning 价格', '测试本机代理'],
  },
  {
    id: 'dashscope-compatible',
    label: 'DashScope-compatible（可编辑示例）',
    shortLabel: 'DashScope',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    helper: '常见 DashScope OpenAI-compatible 接入模板。请以你的控制台和服务文档为准。',
    apiKeyHint: '粘贴你的 DashScope-compatible API Key。',
    modelHint: '填写实际模型名或 deployment ID。',
    pricingHint: '价格为用户自填估算值，不代表官方实时价格。',
    setupSteps: ['确认 compatible-mode Base URL', '确认模型名', '填写 API Key', '填写价格', '用测试请求确认 usage 是否返回'],
  },
  {
    id: 'moonshot-compatible',
    label: 'Moonshot-compatible（可编辑示例）',
    shortLabel: 'Moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    helper: '常见 Moonshot-compatible 接入模板。请按你的服务文档确认 Base URL、模型名和价格。',
    apiKeyHint: '粘贴你的 Moonshot-compatible API Key。',
    modelHint: '填写实际模型名或 endpoint ID。',
    pricingHint: '上下文长度和模型版本可能影响价格，请按实际使用填写。',
    setupSteps: ['确认 Base URL', '确认模型名', '填写 API Key', '填写价格', '测试本机代理'],
  },
  {
    id: 'custom',
    label: '自定义服务商',
    shortLabel: '自定义',
    baseUrl: '',
    helper: '手动填写你的上游 Base URL。只要它兼容 OpenAI SDK，就可以尝试走本机代理。',
    apiKeyHint: '粘贴你的上游服务 API Key，或让客户端自己带 Authorization header。',
    modelHint: '填写上游服务实际要求的 model / deployment / endpoint 字段。',
    pricingHint: '按你自己的服务商价格填写。',
    setupSteps: ['确认上游兼容 OpenAI API', '填写 Base URL', '填写模型 / endpoint', '填写价格', '如失败，请复制诊断信息到 issue'],
  },
];

export const providerTemplateById = (providerId: ProviderId): ProviderTemplate =>
  PROVIDER_TEMPLATES.find((template) => template.id === providerId) ?? PROVIDER_TEMPLATES[0];

export const providerIds = PROVIDER_TEMPLATES.map((template) => template.id);
