import { CheckCircle2, Clipboard, FlaskConical, KeyRound, PlugZap } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { MonitorInfo, ProviderConfig } from '../types';

interface OnboardingCardProps {
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  onSendTestUsageEvent: () => Promise<void>;
  onComplete: () => void;
}

const makeProxyUrl = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : 'http://127.0.0.1:17391/v1';

const makeFirstCurl = (usageUrl: string) => `curl -X POST ${usageUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"source":"demo","scenarioName":"first shred","inputTokens":120000,"outputTokens":45000}'`;

export function OnboardingCard({
  monitorInfo,
  providerConfig,
  onSendTestUsageEvent,
  onComplete,
}: OnboardingCardProps) {
  const [status, setStatus] = useState('');
  const curl = useMemo(() => makeFirstCurl(monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage'), [monitorInfo.usageUrl]);
  const proxyUrl = useMemo(() => makeProxyUrl(monitorInfo), [monitorInfo]);
  const missingFields = [
    providerConfig.apiKey.trim() ? '' : 'API Key',
    providerConfig.upstreamBaseUrl.trim() ? '' : 'Base URL',
    providerConfig.model.trim() ? '' : '模型/接入点 ID',
  ].filter(Boolean);

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curl);
    setStatus('高级 usage curl 已复制');
    window.setTimeout(() => setStatus(''), 1_200);
  };

  const sendTest = async () => {
    try {
      await onSendTestUsageEvent();
      setStatus('测试 usage 已发送');
    } catch {
      setStatus('测试发送失败，请确认本地服务运行中');
    } finally {
      window.setTimeout(() => setStatus(''), 1_800);
    }
  };

  return (
    <section className="glass-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-cyan-700 dark:text-cyan-200">首次引导</p>
          <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">
            欢迎使用 Token Shredder
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
            第一次使用不需要手动输入 token。你只要在下面填好必要信息，然后让你的 AI 客户端走 Token Shredder 的本机 Base URL，宠物就会按真实 usage 碎钱。
          </p>
        </div>
        <CheckCircle2 className="mt-1 shrink-0 text-cyan-700 dark:text-cyan-200" size={24} />
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
            <KeyRound size={16} />
            <span>1. 填必要信息</span>
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
            必填：API Key、上游 Base URL、模型/接入点 ID。价格也需要确认，因为它决定宠物碎掉多少美元。
          </p>
          {missingFields.length > 0 ? (
            <p className="mt-2 text-xs font-black text-amber-700 dark:text-amber-200">
              当前还差：{missingFields.join('、')}
            </p>
          ) : (
            <p className="mt-2 text-xs font-black text-lime-700 dark:text-lime-200">
              必要接入信息已填写，可以保存并测试。
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
            <PlugZap size={16} />
            <span>2. 把 AI 客户端改成本机 Base URL</span>
          </div>
          <code className="block break-all rounded-md bg-slate-950 px-3 py-2 text-xs font-black text-cyan-100">
            {proxyUrl}
          </code>
          <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            客户端里可以使用占位 key：token-shredder-local。Token Shredder 会在本机转发到你配置的上游服务。
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300">
        如果你只是想先看桌面宠物动起来，可以点击“发送体验 usage”。这不会调用真实模型，只会写入一条本机测试 usage。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copyCurl()} className="action-button">
          <Clipboard size={16} />
          <span>复制高级 usage curl</span>
        </button>
        <button type="button" onClick={() => void sendTest()} className="action-button">
          <FlaskConical size={16} />
          <span>发送体验 usage</span>
        </button>
        <button type="button" onClick={onComplete} className="action-button">
          <CheckCircle2 size={16} />
          <span>开始使用</span>
        </button>
      </div>

      {status ? <p className="mt-3 text-sm font-black text-cyan-700 dark:text-cyan-200">{status}</p> : null}
    </section>
  );
}
