import { Clipboard, FlaskConical, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AppState, CalculationResult, MonitorInfo, PetRuntimeState } from '../types';
import { formatCurrency, formatPercent, formatTokens } from '../lib/formatting';
import { runtimeStateDescription, runtimeStateLabel } from '../lib/runtime';

interface StatusPanelProps {
  state: AppState;
  result: CalculationResult;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  onClearMonitoring: () => void;
  onSendTestUsageEvent: () => Promise<void>;
  onRunQuickStartDemo: () => void;
}

const serviceLabel = (monitorInfo: MonitorInfo) => {
  if (monitorInfo.status === 'running') {
    return monitorInfo.preferredPortAvailable
      ? '本地服务运行中'
      : `本地服务运行中，已自动切换到 ${monitorInfo.port}`;
  }

  if (monitorInfo.status === 'error') {
    return '本地服务未启动';
  }

  return '本地服务启动中';
};

export function StatusPanel({
  state,
  result,
  runtimeState,
  monitorInfo,
  onClearMonitoring,
  onSendTestUsageEvent,
  onRunQuickStartDemo,
}: StatusPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const [testStatus, setTestStatus] = useState('');
  const latestEvent = state.monitoring.events[0];

  const copyAddress = async () => {
    await navigator.clipboard.writeText(monitorInfo.usageUrl || '本地服务未启动');
    setCopyStatus('已复制');
    window.setTimeout(() => setCopyStatus(''), 1_200);
  };

  const sendTest = async () => {
    try {
      await onSendTestUsageEvent();
      setTestStatus('已发送');
    } catch {
      setTestStatus('发送失败');
    } finally {
      window.setTimeout(() => setTestStatus(''), 1_500);
    }
  };

  return (
    <section className="glass-panel p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">当前状态</h2>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            {serviceLabel(monitorInfo)}
          </p>
          {monitorInfo.error ? (
            <p className="mt-1 text-xs font-black text-rose-700 dark:text-rose-200">{monitorInfo.error}</p>
          ) : null}
        </div>
        <div className="border-4 border-slate-950 bg-cyan-200 px-3 py-2 text-sm font-black text-slate-950 dark:border-cyan-200 dark:bg-cyan-300">
          {runtimeStateLabel[runtimeState]}
        </div>
      </div>

      <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        {runtimeStateDescription[runtimeState]}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">服务地址</div>
          <code className="mt-1 block break-all text-sm font-black text-slate-950 dark:text-cyan-100">
            {monitorInfo.usageUrl || '不可用'}
          </code>
        </div>
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Total burned</div>
          <div className="mt-1 text-lg font-black text-rose-700 dark:text-rose-200">
            {formatCurrency(result.totalCost)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">完整纸币</div>
          <div className="mt-1 text-lg font-black text-slate-950 dark:text-white">
            {formatTokens(result.destroyedBills)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">当前纸币</div>
          <div className="mt-1 text-lg font-black text-cyan-700 dark:text-cyan-200">
            {formatPercent(result.currentBillProgress)}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button type="button" onClick={onRunQuickStartDemo} className="action-button">
          <Sparkles size={16} />
          <span>一键试玩</span>
        </button>
        <button type="button" onClick={() => void copyAddress()} className="action-button">
          <Clipboard size={16} />
          <span>{copyStatus || '复制接入地址'}</span>
        </button>
        <button type="button" onClick={() => void sendTest()} className="action-button">
          <FlaskConical size={16} />
          <span>{testStatus || '发送测试 usage'}</span>
        </button>
        <button type="button" onClick={onClearMonitoring} className="action-button">
          <Trash2 size={16} />
          <span>清空 session</span>
        </button>
      </div>

      <div className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
        最近 usage：
        {latestEvent
          ? `${new Date(latestEvent.timestamp).toLocaleTimeString()} · ${latestEvent.source} · ${latestEvent.scenarioName}`
          : '暂无真实 usage'}
      </div>
    </section>
  );
}
