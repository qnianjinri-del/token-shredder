import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  Compass,
  FlaskConical,
  Play,
  Send,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { createSetupPackageText } from '../lib/integrationExamples';
import { deriveSetupReadiness, setupReadinessSummary } from '../lib/setupReadiness';
import type {
  AppState,
  MonitorInfo,
  PetRuntimeState,
  ProviderConfig,
  ProviderTestResult,
} from '../types';

interface NextStepPanelProps {
  state: AppState;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  onRunQuickStartDemo: () => void;
  onSendTestUsageEvent: () => Promise<void>;
  onTestProvider: (config: ProviderConfig, prompt: string) => Promise<ProviderTestResult>;
}

const toneClasses = {
  ok: 'border-lime-400/70 bg-lime-100 text-lime-950 dark:bg-lime-300/20 dark:text-lime-100',
  warn: 'border-amber-400/70 bg-amber-100 text-amber-950 dark:bg-amber-300/20 dark:text-amber-100',
  info: 'border-cyan-400/70 bg-cyan-100 text-cyan-950 dark:bg-cyan-300/15 dark:text-cyan-100',
};

export function NextStepPanel({
  state,
  runtimeState,
  monitorInfo,
  providerConfig,
  onRunQuickStartDemo,
  onSendTestUsageEvent,
  onTestProvider,
}: NextStepPanelProps) {
  const [actionStatus, setActionStatus] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const readiness = useMemo(
    () =>
      deriveSetupReadiness({
        state,
        runtimeState,
        monitorInfo,
        providerConfig,
      }),
    [monitorInfo, providerConfig, runtimeState, state],
  );
  const usageUrl = monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage';
  const proxyBaseUrl = monitorInfo.port
    ? `http://${monitorInfo.host}:${monitorInfo.port}/v1`
    : 'http://127.0.0.1:17391/v1';
  const setupPackageText = useMemo(
    () =>
      createSetupPackageText({
        usageUrl,
        proxyBaseUrl,
        model: providerConfig.model,
        readinessSummary: setupReadinessSummary(readiness),
      }),
    [providerConfig.model, proxyBaseUrl, readiness, usageUrl],
  );

  const runPrimaryAction = async () => {
    setActionStatus('');

    if (readiness.primaryAction === 'quick-demo') {
      onRunQuickStartDemo();
      setActionStatus('已写入本机试玩 usage');
      window.setTimeout(() => setActionStatus(''), 1_600);
      return;
    }

    if (readiness.primaryAction === 'collector-test') {
      try {
        await onSendTestUsageEvent();
        setActionStatus('collector 测试 usage 已发送');
      } catch (error) {
        setActionStatus(error instanceof Error ? error.message : 'collector 测试失败');
      }
      window.setTimeout(() => setActionStatus(''), 1_800);
      return;
    }

    if (readiness.primaryAction === 'provider-test') {
      const result = await onTestProvider({ ...providerConfig, enabled: true }, providerConfig.testPrompt);
      setActionStatus(
        result.ok
          ? `代理测试成功${result.usageEvent ? '，已收到 usage' : '，但上游没有返回 usage'}`
          : `代理测试失败：${result.error ?? '请检查 API Key、Base URL 和模型 ID'}`,
      );
      window.setTimeout(() => setActionStatus(''), 3_200);
    }
  };

  const copySetupPackage = async () => {
    await navigator.clipboard.writeText(setupPackageText);
    setCopyStatus('当前接入包已复制');
    window.setTimeout(() => setCopyStatus(''), 1_600);
  };

  const primaryButton = readiness.primaryAction === 'none' ? (
    <a href={readiness.primaryHref ?? '#start-here'} className="action-button">
      <Compass size={16} />
      <span>{readiness.primaryLabel}</span>
    </a>
  ) : (
    <button type="button" onClick={() => void runPrimaryAction()} className="action-button">
      {readiness.primaryAction === 'quick-demo' ? <Play size={16} /> : null}
      {readiness.primaryAction === 'collector-test' ? <FlaskConical size={16} /> : null}
      {readiness.primaryAction === 'provider-test' ? <Send size={16} /> : null}
      <span>{readiness.primaryLabel}</span>
    </button>
  );

  return (
    <section className={`rounded-lg border-4 p-4 shadow-[5px_5px_0_rgba(15,23,42,0.75)] ${toneClasses[readiness.tone]}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-normal">
            {readiness.tone === 'warn' ? <AlertTriangle size={16} /> : <Compass size={16} />}
            <span>下一步建议</span>
          </div>
          <h2 className="mt-2 text-xl font-black">{readiness.title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-bold leading-relaxed">{readiness.message}</p>
          {actionStatus ? <p className="mt-2 text-xs font-black">{actionStatus}</p> : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {primaryButton}
          <a href="#recipes" className="action-button">
            <ClipboardCheck size={16} />
            <span>复制接入示例</span>
          </a>
          <button type="button" onClick={() => void copySetupPackage()} className="action-button">
            <Clipboard size={16} />
            <span>{copyStatus || '复制当前接入包'}</span>
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {readiness.checks.map((check) => (
          <div
            key={check.label}
            className="rounded-lg border border-slate-950/20 bg-white/65 p-3 text-slate-950 dark:border-white/10 dark:bg-slate-950/35 dark:text-white"
          >
            <div className="flex items-center gap-2 text-xs font-black">
              <span className={check.done ? 'text-lime-700 dark:text-lime-200' : 'text-slate-500 dark:text-slate-400'}>
                <CheckCircle2 size={15} fill={check.done ? 'currentColor' : 'none'} />
              </span>
              <span>{check.label}</span>
            </div>
            <p className="mt-1 break-words text-[11px] font-bold leading-relaxed text-slate-600 dark:text-slate-300">
              {check.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
