import { Activity, Clipboard, HeartPulse, PlayCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  buildSelfCheckReport,
  createStaticSelfCheckItems,
  getSelfCheckNextAction,
  selfCheckStatusLabel,
  summarizeSelfCheckStatus,
  type SelfCheckItem,
} from '../lib/selfCheck';
import type { AppState, MonitorInfo, PetRuntimeState, ProviderConfig } from '../types';

interface SelfCheckPanelProps {
  state: AppState;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
  onSendTestUsageEvent: () => Promise<void>;
}

const statusClasses = {
  pass: 'border-lime-400/60 bg-lime-100 text-lime-950 dark:bg-lime-300/20 dark:text-lime-100',
  warn: 'border-amber-400/60 bg-amber-100 text-amber-950 dark:bg-amber-300/20 dark:text-amber-100',
  fail: 'border-rose-400/60 bg-rose-100 text-rose-950 dark:bg-rose-300/20 dark:text-rose-100',
};

export function SelfCheckPanel({
  state,
  runtimeState,
  monitorInfo,
  providerConfig,
  onSendTestUsageEvent,
}: SelfCheckPanelProps) {
  const [dynamicItems, setDynamicItems] = useState<SelfCheckItem[]>([]);
  const [running, setRunning] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const staticItems = useMemo(
    () =>
      createStaticSelfCheckItems({
        state,
        runtimeState,
        monitorInfo,
        providerConfig,
      }),
    [monitorInfo, providerConfig, runtimeState, state],
  );
  const items = useMemo(() => [...dynamicItems, ...staticItems], [dynamicItems, staticItems]);
  const overall = summarizeSelfCheckStatus(items);
  const nextAction = useMemo(() => getSelfCheckNextAction(items), [items]);
  const report = useMemo(
    () =>
      buildSelfCheckReport({
        input: {
          state,
          runtimeState,
          monitorInfo,
          providerConfig,
        },
        items,
      }),
    [items, monitorInfo, providerConfig, runtimeState, state],
  );

  const runSelfCheck = async () => {
    setRunning(true);
    const nextItems: SelfCheckItem[] = [];

    if (!monitorInfo.healthUrl) {
      nextItems.push({
        id: 'health-request',
        label: 'GET /health',
        status: 'fail',
        detail: 'health URL 不可用。',
      });
    } else {
      try {
        const response = await fetch(monitorInfo.healthUrl);
        const json = (await response.json()) as { ok?: boolean; app?: string; port?: number };
        nextItems.push({
          id: 'health-request',
          label: 'GET /health',
          status: response.ok && json.ok === true ? 'pass' : 'fail',
          detail:
            response.ok && json.ok === true
              ? `${json.app ?? 'Token Shredder'} 返回正常，端口 ${json.port ?? monitorInfo.port ?? '未知'}。`
              : `health 返回异常：HTTP ${response.status}`,
        });
      } catch (error) {
        nextItems.push({
          id: 'health-request',
          label: 'GET /health',
          status: 'fail',
          detail: error instanceof Error ? error.message : '无法访问 health endpoint。',
        });
      }
    }

    try {
      await onSendTestUsageEvent();
      nextItems.push({
        id: 'collector-post',
        label: 'POST /usage 测试',
        status: 'pass',
        detail: 'collector 接受了一条本机测试 usage，桌面宠物应该短暂响应。',
      });
    } catch (error) {
      nextItems.push({
        id: 'collector-post',
        label: 'POST /usage 测试',
        status: 'fail',
        detail: error instanceof Error ? error.message : 'collector 测试 usage 发送失败。',
      });
    }

    setDynamicItems(nextItems);
    setRunning(false);
  };

  const copyReport = async () => {
    await navigator.clipboard.writeText(report);
    setCopyStatus('体检报告已复制');
    window.setTimeout(() => setCopyStatus(''), 1_600);
  };

  return (
    <section id="self-check" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
            <HeartPulse size={18} />
            <h2 className="text-base font-black text-slate-950 dark:text-white">自动体检</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            一键检查本地服务、health、collector、价格、provider 字段和真实 usage 状态。报告不会包含 API Key 或 prompt 内容。
          </p>
        </div>
        <div className={`border px-3 py-2 text-xs font-black ${statusClasses[overall]}`}>
          总体：{selfCheckStatusLabel[overall]}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => void runSelfCheck()} disabled={running} className="action-button disabled:opacity-60">
          <PlayCircle size={16} />
          <span>{running ? '体检中' : '运行自动体检'}</span>
        </button>
        <button type="button" onClick={() => void copyReport()} className="action-button">
          <Clipboard size={16} />
          <span>{copyStatus || '复制体检报告'}</span>
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-100/80 px-3 py-2 text-xs font-bold text-cyan-950 dark:bg-cyan-300/10 dark:text-cyan-100">
        <p className="text-[10px] font-black uppercase tracking-wide opacity-70">下一步建议</p>
        <p className="mt-1 leading-relaxed">{nextAction}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border px-3 py-2 text-xs font-bold ${statusClasses[item.status]}`}
          >
            <div className="flex items-center gap-2 text-sm font-black">
              <Activity size={15} />
              <span>{item.label}</span>
              <span className="ml-auto">{selfCheckStatusLabel[item.status]}</span>
            </div>
            <p className="mt-1 break-words leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
