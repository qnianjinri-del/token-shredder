import { Activity, Clipboard, FlaskConical, Terminal, Trash2, Wifi } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppState, MonitorInfo, UsageEvent } from '../types';
import { formatAdaptiveCurrency, formatTokens } from '../lib/formatting';
import { createIntegrationExamples } from '../lib/integrationExamples';
import { calculateUsageEventCost } from '../lib/usage';

interface MonitorPanelProps {
  state: AppState;
  monitorInfo: MonitorInfo;
  onClearMonitoring: () => void;
  onSendTestUsageEvent: () => Promise<void>;
}

const makeDeleteExample = (usageUrl: string) => `curl -X DELETE ${usageUrl}`;

const eventTokenTotal = (event: UsageEvent) =>
  event.inputTokens + event.outputTokens + event.cachedInputTokens + event.reasoningTokens;

const formatCodexWindow = (usedPercent: number | null | undefined, resetsAt: number | null | undefined) => {
  const percentLabel = typeof usedPercent === 'number' ? `${usedPercent.toFixed(1)}%` : '未知';
  const resetLabel =
    typeof resetsAt === 'number' && resetsAt > 0
      ? new Date(resetsAt * 1_000).toLocaleTimeString()
      : '未知';

  return `${percentLabel} · 重置 ${resetLabel}`;
};

export function MonitorPanel({
  state,
  monitorInfo,
  onClearMonitoring,
  onSendTestUsageEvent,
}: MonitorPanelProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [testState, setTestState] = useState<'idle' | 'sent' | 'failed'>('idle');
  const events = state.monitoring.events;
  const codexMonitor = monitorInfo.codexMonitor;
  const usageUrl = monitorInfo.usageUrl || 'http://127.0.0.1:17391/usage';
  const proxyBaseUrl = monitorInfo.port
    ? `http://${monitorInfo.host}:${monitorInfo.port}/v1`
    : 'http://127.0.0.1:17391/v1';
  const examples = useMemo(
    () =>
      createIntegrationExamples({
        usageUrl,
        proxyBaseUrl,
        model: '',
      }),
    [proxyBaseUrl, usageUrl],
  );
  const deleteExample = useMemo(() => makeDeleteExample(usageUrl), [usageUrl]);

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1_200);
  };

  const sendTest = async () => {
    try {
      await onSendTestUsageEvent();
      setTestState('sent');
    } catch {
      setTestState('failed');
    } finally {
      window.setTimeout(() => setTestState('idle'), 1_500);
    }
  };

  return (
    <section id="monitoring" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
            <Wifi size={18} />
            <h2 className="text-base font-black text-slate-950 dark:text-white">高级 usage 接入</h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            如果你的脚本或 Agent 已经能拿到 usage 数字，可以直接 POST 到本机。新手优先使用上方本机代理。
          </p>
        </div>
        <button type="button" onClick={sendTest} className="action-button">
          <FlaskConical size={16} />
          <span>{testState === 'sent' ? '已发送' : testState === 'failed' ? '发送失败' : '测试采集'}</span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Usage endpoint</div>
          <code className="mt-1 block break-all text-sm font-black text-slate-950 dark:text-cyan-100">
            {monitorInfo.usageUrl}
          </code>
        </div>
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Health check</div>
          <code className="mt-1 block break-all text-sm font-black text-slate-950 dark:text-cyan-100">
            {monitorInfo.healthUrl}
          </code>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
        <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Codex 本地监控</div>
        <div className="mt-1 text-sm font-black text-slate-950 dark:text-white">
          {codexMonitor?.status === 'watching'
            ? '已启用：只读取本机 token_count 行'
            : codexMonitor?.status === 'error'
              ? `异常：${codexMonitor.error ?? '无法读取 Codex 日志'}`
              : '未发现 ~/.codex/sessions'}
        </div>
        {codexMonitor?.rateLimits ? (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>主额度 {formatCodexWindow(codexMonitor.rateLimits.primary?.usedPercent, codexMonitor.rateLimits.primary?.resetsAt)}</span>
            {codexMonitor.rateLimits.secondary ? (
              <span>
                周额度 {formatCodexWindow(codexMonitor.rateLimits.secondary.usedPercent, codexMonitor.rateLimits.secondary.resetsAt)}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
            打开 Token Shredder 后，Codex 新产生的 token_count 会自动驱动碎钞。
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
              <Terminal size={14} />
              curl
            </span>
            <button type="button" onClick={() => copy(examples.curlUsage)} className="mini-action-button">
              <Clipboard size={14} />
              <span>{copyState === 'copied' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
            {examples.curlUsage}
          </pre>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
              <Activity size={14} />
              JavaScript
            </span>
            <button type="button" onClick={() => copy(examples.jsUsage)} className="mini-action-button">
              <Clipboard size={14} />
              <span>{copyState === 'copied' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
            {examples.jsUsage}
          </pre>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
              <Activity size={14} />
              Python
            </span>
            <button type="button" onClick={() => copy(examples.pythonUsage)} className="mini-action-button">
              <Clipboard size={14} />
              <span>{copyState === 'copied' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
            {examples.pythonUsage}
          </pre>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
              <Trash2 size={14} />
              DELETE /usage
            </span>
            <button type="button" onClick={() => copy(deleteExample)} className="mini-action-button">
              <Clipboard size={14} />
              <span>{copyState === 'copied' ? '已复制' : '复制'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
            {deleteExample}
          </pre>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">当前 session</div>
          <div className="mt-1 text-sm font-black text-slate-950 dark:text-white">
            {formatTokens(events.length)} 条事件 · 直接成本 {formatAdaptiveCurrency(state.monitoring.directCostTotal)}
          </div>
        </div>
        <button type="button" onClick={onClearMonitoring} className="action-button">
          <Trash2 size={16} />
          <span>清空 session</span>
        </button>
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]">
        {events.length === 0 ? (
          <div className="p-4 text-sm font-bold text-slate-500 dark:text-slate-400">
            还没有采集到真实 usage。点击“测试采集”或让你的程序 POST 一条 usage。
          </div>
        ) : (
          events.slice(0, 12).map((event) => (
            <div
              key={event.id}
              className="grid gap-1 border-b border-slate-300/70 p-3 last:border-b-0 dark:border-white/10"
            >
              <div className="flex items-center justify-between gap-3">
                <strong className="truncate text-sm text-slate-950 dark:text-white">{event.scenarioName}</strong>
                <span className="shrink-0 text-xs font-black text-cyan-700 dark:text-cyan-200">
                  {formatTokens(eventTokenTotal(event))} tokens
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{event.source}</span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span>in {formatTokens(event.inputTokens)}</span>
                <span>out {formatTokens(event.outputTokens)}</span>
                <span>cache {formatTokens(event.cachedInputTokens)}</span>
                <span>reasoning {formatTokens(event.reasoningTokens)}</span>
                <span>direct {formatAdaptiveCurrency(event.directCost)}</span>
                <span>event cost {formatAdaptiveCurrency(calculateUsageEventCost(event, state.pricing))}</span>
                {event.codexRateLimits?.primary ? (
                  <span>
                    Codex 主额度 {formatCodexWindow(event.codexRateLimits.primary.usedPercent, event.codexRateLimits.primary.resetsAt)}
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
