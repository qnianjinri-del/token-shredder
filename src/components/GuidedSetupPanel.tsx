import {
  CheckCircle2,
  Clipboard,
  Code2,
  KeyRound,
  Play,
  Radar,
  Route,
  Send,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { createIntegrationExamples } from '../lib/integrationExamples';
import { buildSetupPaths, suggestSetupPathId, type SetupPathId } from '../lib/setupPaths';
import type { AppState, MonitorInfo, ProviderConfig } from '../types';

interface GuidedSetupPanelProps {
  state: AppState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  onRunQuickStartDemo: () => void;
  onSendTestUsageEvent: () => Promise<void>;
}

const pathIcons: Record<SetupPathId, typeof Play> = {
  'quick-demo': Play,
  'provider-proxy': KeyRound,
  'direct-usage': TerminalSquare,
  'codex-monitor': Radar,
};

const pathAccentClasses: Record<SetupPathId, string> = {
  'quick-demo': 'border-lime-300 bg-lime-200 text-lime-950',
  'provider-proxy': 'border-cyan-300 bg-cyan-100 text-cyan-950',
  'direct-usage': 'border-amber-300 bg-amber-100 text-amber-950',
  'codex-monitor': 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-950',
};

const proxyBaseUrlFrom = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : 'http://127.0.0.1:17391/v1';

export function GuidedSetupPanel({
  state,
  monitorInfo,
  providerConfig,
  onRunQuickStartDemo,
  onSendTestUsageEvent,
}: GuidedSetupPanelProps) {
  const suggestedPathId = useMemo(
    () => suggestSetupPathId({ state, monitorInfo, providerConfig }),
    [monitorInfo, providerConfig, state],
  );
  const [selectedPathId, setSelectedPathId] = useState<SetupPathId>(suggestedPathId);
  const [copyStatus, setCopyStatus] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sent' | 'failed'>('idle');
  const usageUrl = monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage';
  const proxyBaseUrl = proxyBaseUrlFrom(monitorInfo);
  const examples = useMemo(
    () =>
      createIntegrationExamples({
        usageUrl,
        proxyBaseUrl,
        model: providerConfig.model,
      }),
    [providerConfig.model, proxyBaseUrl, usageUrl],
  );
  const paths = useMemo(
    () => buildSetupPaths({ state, monitorInfo, providerConfig }),
    [monitorInfo, providerConfig, state],
  );
  const selectedPath = paths.find((path) => path.id === selectedPathId) ?? paths[0]!;
  const SelectedIcon = pathIcons[selectedPath.id];

  useEffect(() => {
    setSelectedPathId(suggestedPathId);
  }, [suggestedPathId]);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopyStatus(label);
    window.setTimeout(() => setCopyStatus(''), 1_500);
  };

  const sendCollectorTest = async () => {
    try {
      await onSendTestUsageEvent();
      setTestStatus('sent');
    } catch {
      setTestStatus('failed');
    } finally {
      window.setTimeout(() => setTestStatus('idle'), 1_600);
    }
  };

  const copySelectedPath = () => {
    const text = [
      `Token Shredder 接入路径：${selectedPath.title}`,
      selectedPath.summary,
      '',
      '必要信息：',
      ...selectedPath.requiredInfo.map((item) => `- ${item.label}: ${item.detail}`),
      '',
      '步骤：',
      ...selectedPath.steps.map((step, index) => `${index + 1}. ${step.label}: ${step.detail}`),
      '',
      `隐私边界：${selectedPath.privacyNote}`,
    ].join('\n');

    return copy(text, '路径清单已复制');
  };

  const copyDirectExamples = () =>
    copy(
      [
        examples.curlUsage,
        '',
        'JavaScript:',
        examples.jsUsage,
        '',
        'Python:',
        examples.pythonUsage,
      ].join('\n\n'),
      'POST 示例已复制',
    );

  return (
    <section id="guided-setup" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 border-4 border-slate-950 bg-cyan-100 px-3 py-1 text-xs font-black text-slate-950 shadow-[3px_3px_0_rgba(15,23,42,0.82)] dark:border-cyan-100 dark:bg-cyan-200">
            <Route size={15} />
            <span>新手向导</span>
          </div>
          <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
            你只需要先选一种使用方式
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300">
            不用先理解所有设置。选一条路，照右侧步骤做：先看效果、有 API Key 走本机代理、已有 usage 就直接上报，或者让 Codex 本地事件自动驱动宠物。
          </p>
        </div>
        <div className="rounded-lg border-4 border-slate-950 bg-white px-3 py-2 text-xs font-black text-slate-950 dark:border-cyan-200 dark:bg-[#111827] dark:text-white">
          推荐：{paths.find((path) => path.id === suggestedPathId)?.title}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="grid gap-2">
          {paths.map((path) => {
            const Icon = pathIcons[path.id];
            const active = path.id === selectedPath.id;

            return (
              <button
                key={path.id}
                type="button"
                onClick={() => setSelectedPathId(path.id)}
                className={`border-4 p-3 text-left shadow-[4px_4px_0_rgba(15,23,42,0.65)] transition ${
                  active
                    ? `${pathAccentClasses[path.id]} border-slate-950`
                    : 'border-slate-300 bg-white text-slate-950 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06] dark:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm font-black">
                    <Icon size={17} />
                    <span>{path.title}</span>
                  </span>
                  <span className="shrink-0 rounded bg-slate-950 px-2 py-1 text-[10px] font-black text-cyan-100">
                    {path.doneCount}/{path.totalCount}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold leading-relaxed opacity-80">{path.bestFor}</p>
                <p className="mt-2 text-[11px] font-black uppercase opacity-70">{path.badge}</p>
              </button>
            );
          })}
        </div>

        <article className={`border-4 p-4 shadow-[5px_5px_0_rgba(15,23,42,0.72)] ${pathAccentClasses[selectedPath.id]}`}>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase">
                <SelectedIcon size={16} />
                <span>{selectedPath.badge}</span>
              </div>
              <h3 className="mt-2 text-xl font-black">{selectedPath.title}</h3>
              <p className="mt-1 text-sm font-bold leading-relaxed">{selectedPath.summary}</p>
            </div>
            <button type="button" onClick={() => void copySelectedPath()} className="action-button shrink-0 bg-white">
              <Clipboard size={16} />
              <span>{copyStatus === '路径清单已复制' ? '已复制' : '复制路径清单'}</span>
            </button>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-950/20 bg-white/70 p-3">
              <h4 className="text-xs font-black uppercase text-slate-700">必要信息</h4>
              <div className="mt-2 grid gap-2">
                {selectedPath.requiredInfo.map((item) => (
                  <div key={item.label} className="flex gap-2 text-xs font-bold">
                    <CheckCircle2
                      size={15}
                      className={item.done ? 'mt-0.5 shrink-0 text-lime-700' : 'mt-0.5 shrink-0 text-slate-400'}
                      fill={item.done ? 'currentColor' : 'none'}
                    />
                    <span className="min-w-0">
                      <span className="font-black">{item.label}</span>
                      <span className="block break-words opacity-75">{item.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-950/20 bg-white/70 p-3">
              <h4 className="text-xs font-black uppercase text-slate-700">接下来做什么</h4>
              <ol className="mt-2 grid gap-2 text-xs font-bold">
                {selectedPath.steps.map((step, index) => (
                  <li key={`${step.label}-${index}`} className="grid grid-cols-[22px_1fr] gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center bg-slate-950 text-[10px] font-black text-cyan-100">
                      {index + 1}
                    </span>
                    <span>
                      {step.href ? (
                        <a href={step.href} className="font-black underline decoration-4 underline-offset-4">
                          {step.label}
                        </a>
                      ) : (
                        <span className="font-black">{step.label}</span>
                      )}
                      <span className="block break-words opacity-75">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedPath.id === 'quick-demo' ? (
              <button type="button" onClick={onRunQuickStartDemo} className="action-button bg-white">
                <Play size={16} />
                <span>一键试玩</span>
              </button>
            ) : null}

            {selectedPath.id === 'provider-proxy' ? (
              <>
                <a href="#provider-setup" className="action-button bg-white">
                  <KeyRound size={16} />
                  <span>填写 API Key 等信息</span>
                </a>
                <button
                  type="button"
                  onClick={() => void copy(examples.openAiSdkProxy, 'SDK 示例已复制')}
                  className="action-button bg-white"
                >
                  <Code2 size={16} />
                  <span>复制 SDK 示例</span>
                </button>
              </>
            ) : null}

            {selectedPath.id === 'direct-usage' ? (
              <>
                <button type="button" onClick={() => void copyDirectExamples()} className="action-button bg-white">
                  <Clipboard size={16} />
                  <span>复制 POST 示例</span>
                </button>
                <button type="button" onClick={() => void sendCollectorTest()} className="action-button bg-white">
                  <Send size={16} />
                  <span>{testStatus === 'sent' ? '已发送' : testStatus === 'failed' ? '发送失败' : '发送测试 usage'}</span>
                </button>
              </>
            ) : null}

            {selectedPath.id === 'codex-monitor' ? (
              <a href="#monitoring" className="action-button bg-white">
                <Radar size={16} />
                <span>查看 Codex 监控</span>
              </a>
            ) : null}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-950/20 bg-white/70 p-3 text-xs font-bold">
            <ShieldCheck className="mt-0.5 shrink-0 text-cyan-700" size={15} />
            <p>{selectedPath.privacyNote}</p>
          </div>

          {copyStatus ? <p className="mt-3 text-sm font-black">{copyStatus}</p> : null}
        </article>
      </div>
    </section>
  );
}
