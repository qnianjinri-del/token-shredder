import {
  CheckCircle2,
  Clipboard,
  FlaskConical,
  KeyRound,
  Palette,
  Play,
  PlugZap,
  Route,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { createIntegrationExamples } from '../lib/integrationExamples';
import { PET_SKINS } from '../lib/pet';
import { runtimeStateLabel } from '../lib/runtime';
import type { MonitorInfo, PetRuntimeState, ProviderConfig, PetSkinId } from '../types';

interface StartHerePanelProps {
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  runtimeState: PetRuntimeState;
  petSkin: PetSkinId;
  usageEventCount: number;
  onboardingComplete: boolean;
  onRunQuickStartDemo: () => void;
  onSendTestUsageEvent: () => Promise<void>;
  onCompleteOnboarding: () => void;
}

const proxyBaseUrlFrom = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : 'http://127.0.0.1:17391/v1';

const providerMissingFields = (providerConfig: ProviderConfig) =>
  [
    providerConfig.apiKey.trim() ? '' : 'API Key',
    providerConfig.upstreamBaseUrl.trim() ? '' : '上游 Base URL',
    providerConfig.model.trim() ? '' : '模型 / 接入点 ID',
  ].filter(Boolean);

export function StartHerePanel({
  monitorInfo,
  providerConfig,
  runtimeState,
  petSkin,
  usageEventCount,
  onboardingComplete,
  onRunQuickStartDemo,
  onSendTestUsageEvent,
  onCompleteOnboarding,
}: StartHerePanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sent' | 'failed'>('idle');
  const usageUrl = monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage';
  const proxyBaseUrl = proxyBaseUrlFrom(monitorInfo);
  const activeSkin = PET_SKINS.find((skin) => skin.id === petSkin)?.label ?? '碎钞机';
  const missingFields = providerMissingFields(providerConfig);
  const examples = useMemo(
    () =>
      createIntegrationExamples({
        usageUrl,
        proxyBaseUrl,
        model: providerConfig.model,
      }),
    [providerConfig.model, proxyBaseUrl, usageUrl],
  );

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopyStatus(label);
    window.setTimeout(() => setCopyStatus(''), 1_400);
  };

  const sendTest = async () => {
    try {
      await onSendTestUsageEvent();
      setTestStatus('sent');
    } catch {
      setTestStatus('failed');
    } finally {
      window.setTimeout(() => setTestStatus('idle'), 1_600);
    }
  };

  return (
    <section id="start-here" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 border-4 border-slate-950 bg-lime-200 px-3 py-1 text-xs font-black text-slate-950 shadow-[3px_3px_0_rgba(15,23,42,0.82)] dark:border-lime-100 dark:bg-lime-300">
            <Route size={15} />
            <span>从这里开始</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
            第一次打开，只需要选一条路
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
            桌面上只保留宠物。后台负责接入、价格和皮肤。你可以先无 Key 试玩；有 API Key 时走本机代理；
            如果自己的脚本已经能拿到 token 数，就直接 POST usage。
          </p>
        </div>

        <div className="grid min-w-[220px] gap-2 text-xs font-black">
          <div className="flex items-center justify-between gap-3 border-4 border-slate-950 bg-white px-3 py-2 text-slate-950 dark:border-cyan-200 dark:bg-[#111827] dark:text-white">
            <span>当前状态</span>
            <span className="text-cyan-700 dark:text-cyan-200">{runtimeStateLabel[runtimeState]}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-4 border-slate-950 bg-white px-3 py-2 text-slate-950 dark:border-cyan-200 dark:bg-[#111827] dark:text-white">
            <span>当前皮肤</span>
            <span className="text-amber-700 dark:text-amber-200">{activeSkin}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-4 border-slate-950 bg-white px-3 py-2 text-slate-950 dark:border-cyan-200 dark:bg-[#111827] dark:text-white">
            <span>usage 事件</span>
            <span className="text-lime-700 dark:text-lime-200">{usageEventCount}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-3">
        <article className="flex flex-col border-4 border-slate-950 bg-lime-100 p-3 text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.82)] dark:border-lime-100 dark:bg-lime-300">
          <div className="flex items-center gap-2 text-sm font-black">
            <Play size={17} fill="currentColor" />
            <h3>1. 我只是想先看效果</h3>
          </div>
          <p className="mt-2 flex-1 text-xs font-bold leading-relaxed">
            不填 API Key，不请求模型。写入一条本机模拟 usage，宠物碎一次钱，然后停在结果上。
          </p>
          <button type="button" onClick={onRunQuickStartDemo} className="mt-3 action-button bg-white">
            <Play size={16} />
            <span>一键试玩</span>
          </button>
        </article>

        <article className="flex flex-col border-4 border-slate-950 bg-white p-3 text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.82)] dark:border-cyan-200 dark:bg-[#111827] dark:text-white dark:shadow-[4px_4px_0_rgba(103,232,249,0.28)]">
          <div className="flex items-center gap-2 text-sm font-black">
            <KeyRound size={17} />
            <h3>2. 我有服务商 API Key</h3>
          </div>
          <p className="mt-2 flex-1 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
            填 API Key、上游 Base URL、模型 ID 和价格，然后把客户端 baseURL 改成本机代理。
          </p>
          <code className="mt-3 block break-all rounded bg-slate-950 px-2 py-2 text-[11px] font-black text-cyan-100">
            {proxyBaseUrl}
          </code>
          {missingFields.length > 0 ? (
            <p className="mt-2 text-xs font-black text-amber-700 dark:text-amber-200">
              还差：{missingFields.join('、')}
            </p>
          ) : (
            <p className="mt-2 text-xs font-black text-lime-700 dark:text-lime-200">
              必要接入信息已填写
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="#provider-setup" className="action-button">
              <PlugZap size={16} />
              <span>去配置</span>
            </a>
            <button
              type="button"
              onClick={() => void copy(examples.openAiSdkProxy, 'SDK 示例已复制')}
              className="action-button"
            >
              <Clipboard size={16} />
              <span>复制 SDK 示例</span>
            </button>
          </div>
        </article>

        <article className="flex flex-col border-4 border-slate-950 bg-white p-3 text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.82)] dark:border-cyan-200 dark:bg-[#111827] dark:text-white dark:shadow-[4px_4px_0_rgba(103,232,249,0.28)]">
          <div className="flex items-center gap-2 text-sm font-black">
            <TerminalSquare size={17} />
            <h3>3. 我的程序已有 usage 数字</h3>
          </div>
          <p className="mt-2 flex-1 text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-300">
            让 Agent、脚本或 CLI 把 token 数字 POST 到本机接口。无需把 API Key 交给 Token Shredder。
          </p>
          <code className="mt-3 block break-all rounded bg-slate-950 px-2 py-2 text-[11px] font-black text-cyan-100">
            {usageUrl}
          </code>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void copy(examples.curlUsage, 'curl 已复制')} className="action-button">
              <Clipboard size={16} />
              <span>复制 curl</span>
            </button>
            <button
              type="button"
              onClick={() => void copy(examples.agentImplementationPrompt, 'AI 接入提示词已复制')}
              className="action-button"
            >
              <Clipboard size={16} />
              <span>复制给 Codex</span>
            </button>
          </div>
        </article>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <ShieldCheck className="mt-0.5 shrink-0 text-cyan-700 dark:text-cyan-200" size={15} />
          <p>
            Token Shredder 默认只需要 usage 数字。不要把 prompt、completion、messages 或 API key 发到 usage 日志。
            价格是可编辑示例值，正式估算前请按自己的 provider 价格填写。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void sendTest()} className="action-button">
            <FlaskConical size={16} />
            <span>{testStatus === 'sent' ? '测试已发送' : testStatus === 'failed' ? '发送失败' : '发送测试 usage'}</span>
          </button>
          <a href="#pet-skins" className="action-button">
            <Palette size={16} />
            <span>更换皮肤</span>
          </a>
          {!onboardingComplete ? (
            <button type="button" onClick={onCompleteOnboarding} className="action-button">
              <CheckCircle2 size={16} />
              <span>我知道了</span>
            </button>
          ) : null}
        </div>
      </div>

      {copyStatus ? <p className="mt-3 text-sm font-black text-cyan-700 dark:text-cyan-200">{copyStatus}</p> : null}
    </section>
  );
}
