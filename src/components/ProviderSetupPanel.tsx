import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  KeyRound,
  PlugZap,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { createAgentInstructionExample, createOpenAiSdkProxyExample } from '../lib/integrationExamples';
import { providerMissingFields } from '../lib/setupReadiness';
import type {
  ConfigureProviderResult,
  MonitorInfo,
  ProviderConfig,
  ProviderId,
  ProviderTestResult,
} from '../types';

interface ProviderSetupPanelProps {
  providerConfig: ProviderConfig;
  monitorInfo: MonitorInfo;
  onProviderConfigChange: (config: ProviderConfig) => void;
  onConfigureProvider: (config: ProviderConfig) => Promise<ConfigureProviderResult>;
  onTestProvider: (config: ProviderConfig, prompt: string) => Promise<ProviderTestResult>;
  onRunQuickStartDemo: () => void;
}

const providerOptions: Array<{
  id: ProviderId;
  label: string;
  baseUrl: string;
  helper: string;
  modelHint: string;
}> = [
  {
    id: 'volcengine-ark',
    label: '火山方舟 / OpenAI-compatible',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    helper: '适合已有火山引擎方舟 API Key 的用户，Base URL 仍可手动修改。',
    modelHint: '模型 / 接入点 ID 请以火山控制台为准，例如你创建的 endpoint ID。',
  },
  {
    id: 'openai-compatible',
    label: '通用 OpenAI-compatible',
    baseUrl: 'https://api.openai.com/v1',
    helper: '适合任何兼容 OpenAI SDK 的服务商。',
    modelHint: '填写你的服务商模型名或路由 ID。这里不是官方实时模型列表。',
  },
  {
    id: 'custom',
    label: '自定义服务商',
    baseUrl: '',
    helper: '手动填写你的上游 Base URL。',
    modelHint: '填写你的上游服务实际要求的 model / deployment / endpoint 字段。',
  },
];

const proxyBaseUrlFrom = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : '本地服务启动中';

export function ProviderSetupPanel({
  providerConfig,
  monitorInfo,
  onProviderConfigChange,
  onConfigureProvider,
  onTestProvider,
  onRunQuickStartDemo,
}: ProviderSetupPanelProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<ProviderTestResult | null>(null);
  const [copyState, setCopyState] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const proxyBaseUrl = proxyBaseUrlFrom(monitorInfo);
  const sdkExample = useMemo(
    () => createOpenAiSdkProxyExample({ proxyBaseUrl, model: providerConfig.model }),
    [providerConfig.model, proxyBaseUrl],
  );
  const agentInstruction = useMemo(
    () =>
      createAgentInstructionExample({
        usageUrl: monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage',
        proxyBaseUrl,
        model: providerConfig.model,
      }),
    [monitorInfo.usageUrl, providerConfig.model, proxyBaseUrl],
  );
  const selectedProvider = providerOptions.find((option) => option.id === providerConfig.providerId) ?? providerOptions[0];
  const missingFields = providerMissingFields(providerConfig);

  const update = (patch: Partial<ProviderConfig>) => {
    onProviderConfigChange({ ...providerConfig, ...patch });
  };

  const selectProvider = (providerId: ProviderId) => {
    const nextProvider = providerOptions.find((option) => option.id === providerId) ?? providerOptions[0];
    onProviderConfigChange({
      ...providerConfig,
      providerId,
      upstreamBaseUrl: nextProvider.baseUrl || providerConfig.upstreamBaseUrl,
    });
  };

  const saveAndEnable = async () => {
    if (missingFields.length > 0) {
      setValidationMessage(`请先填写：${missingFields.join('、')}`);
      setSaveState('failed');
      window.setTimeout(() => setSaveState('idle'), 1_800);
      return;
    }

    setValidationMessage('');
    const nextConfig = { ...providerConfig, enabled: true };
    onProviderConfigChange(nextConfig);
    const result = await onConfigureProvider(nextConfig);
    setSaveState(result.ok ? 'saved' : 'failed');
    window.setTimeout(() => setSaveState('idle'), 1_800);
  };

  const sendTest = async () => {
    if (missingFields.length > 0) {
      setValidationMessage(`测试前还差：${missingFields.join('、')}`);
      setTestResult({
        ok: false,
        error: `请先填写：${missingFields.join('、')}`,
      });
      return;
    }

    setValidationMessage('');
    const nextConfig = { ...providerConfig, enabled: true };
    onProviderConfigChange(nextConfig);
    const result = await onTestProvider(nextConfig, providerConfig.testPrompt);
    setTestResult(result);
  };

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopyState(label);
    window.setTimeout(() => setCopyState(''), 1_200);
  };

  return (
    <section id="provider-setup" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
            <PlugZap size={18} />
            <h2 className="text-base font-black text-slate-950 dark:text-white">新手接入</h2>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            最快路径：先试玩；正式使用时，选择本机代理接入，或让你的脚本直接 POST usage 到本机接口。
          </p>
        </div>
        <div className="border-4 border-slate-950 bg-lime-200 px-3 py-2 text-xs font-black text-slate-950 dark:border-lime-100 dark:bg-lime-300">
          {providerConfig.enabled ? '代理已配置' : '等待配置'}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-lime-500/50 bg-lime-100 p-3 text-xs font-bold text-lime-950 dark:border-lime-300/30 dark:bg-lime-300/15 dark:text-lime-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>还没有 Key 或不确定怎么接？先用本地模拟 usage 看宠物效果。</span>
          <button type="button" onClick={onRunQuickStartDemo} className="action-button bg-white dark:bg-[#111827]">
            <Sparkles size={16} />
            <span>一键试玩</span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">服务商类型</span>
          <select
            value={providerConfig.providerId}
            onChange={(event) => selectProvider(event.target.value as ProviderId)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            {providerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{selectedProvider.helper}</span>
          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-200">{selectedProvider.modelHint}</span>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">API Key</span>
          <input
            type="password"
            value={providerConfig.apiKey}
            onChange={(event) => update({ apiKey: event.target.value })}
            placeholder="粘贴你的上游服务 API Key"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">上游 Base URL</span>
          <input
            type="url"
            value={providerConfig.upstreamBaseUrl}
            onChange={(event) => update({ upstreamBaseUrl: event.target.value })}
            placeholder="https://example.com/v1"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">模型 / 接入点 ID</span>
          <input
            type="text"
            value={providerConfig.model}
            onChange={(event) => update({ model: event.target.value })}
            placeholder="例如 doubao-xxx 或你的模型名"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
          />
        </label>

        <label className="flex items-start gap-2 rounded-lg border border-slate-300/70 bg-white/60 p-3 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
          <input
            type="checkbox"
            checked={providerConfig.saveApiKey}
            onChange={(event) => update({ saveApiKey: event.target.checked })}
            className="mt-0.5"
          />
          <span>记住 API Key（只保存在本机 localStorage；默认关闭，不会写入 usage 日志）</span>
        </label>
      </div>

      {missingFields.length > 0 ? (
        <div className="mt-3 rounded-lg border border-amber-400/50 bg-amber-100 px-3 py-2 text-xs font-black text-amber-900 dark:bg-amber-300/20 dark:text-amber-100">
          还差：{missingFields.join('、')}
        </div>
      ) : null}

      {validationMessage ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/50 bg-amber-100 px-3 py-2 text-xs font-black text-amber-900 dark:bg-amber-300/20 dark:text-amber-100">
          <AlertCircle className="mt-0.5 shrink-0" size={15} />
          <span>{validationMessage}</span>
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">你的客户端应使用这个 Base URL</div>
        <code className="mt-1 block break-all text-sm font-black text-slate-950 dark:text-cyan-100">
          {proxyBaseUrl}
        </code>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void saveAndEnable()} className="action-button">
          <KeyRound size={16} />
          <span>{saveState === 'saved' ? '已启用' : saveState === 'failed' ? '启用失败' : '保存并启用'}</span>
        </button>
        <button type="button" onClick={() => void sendTest()} className="action-button">
          <Send size={16} />
          <span>发送测试请求</span>
        </button>
        <button type="button" onClick={() => void copy(proxyBaseUrl, 'Base URL 已复制')} className="action-button">
          <Clipboard size={16} />
          <span>{copyState === 'Base URL 已复制' ? copyState : '复制 Base URL'}</span>
        </button>
        <button type="button" onClick={() => void copy(agentInstruction, '接入说明已复制')} className="action-button">
          <Clipboard size={16} />
          <span>{copyState === '接入说明已复制' ? copyState : '复制给 Agent'}</span>
        </button>
      </div>

      <label className="mt-3 grid gap-1">
        <span className="text-xs font-black text-slate-600 dark:text-slate-300">测试提示词</span>
        <input
          type="text"
          value={providerConfig.testPrompt}
          onChange={(event) => update({ testPrompt: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-950 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
        />
      </label>

      {testResult ? (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-xs font-bold ${
            testResult.ok
              ? 'border-lime-400/60 bg-lime-100 text-lime-900 dark:bg-lime-300/20 dark:text-lime-100'
              : 'border-rose-400/60 bg-rose-100 text-rose-900 dark:bg-rose-300/20 dark:text-rose-100'
          }`}
        >
          {testResult.ok ? (
            <span>
              连接成功{testResult.content ? `：${testResult.content}` : ''}。如果上游返回 usage，桌面宠物会短暂碎钱。
            </span>
          ) : (
            <span>连接失败：{testResult.error ?? '请检查 API Key、Base URL 和模型 ID。'}</span>
          )}
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
            <CheckCircle2 size={14} />
            OpenAI SDK 示例
          </span>
          <button type="button" onClick={() => void copy(sdkExample, '示例已复制')} className="mini-action-button">
            <Clipboard size={14} />
            <span>{copyState === '示例已复制' ? '已复制' : '复制'}</span>
          </button>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
          {sdkExample}
        </pre>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <ShieldCheck className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan-200" size={15} />
        <p>
          Token Shredder 只需要 usage 数字来计算成本。测试请求会转发到你的上游服务，但后台不会记录 prompt、completion 或 API Key。
        </p>
      </div>
    </section>
  );
}
