import { Clipboard, FlaskConical, Play, Terminal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createIntegrationExamples } from '../lib/integrationExamples';
import type { MonitorInfo } from '../types';

interface QuickVerifyPanelProps {
  monitorInfo: MonitorInfo;
  onRunQuickStartDemo: () => void;
  onSendTestUsageEvent: () => Promise<void>;
}

const nodeCommand = 'node examples/post-usage-node.mjs';
const pythonCommand = 'python3 examples/post-usage-python.py';

export function QuickVerifyPanel({
  monitorInfo,
  onRunQuickStartDemo,
  onSendTestUsageEvent,
}: QuickVerifyPanelProps) {
  const [copyState, setCopyState] = useState('');
  const [testState, setTestState] = useState<'idle' | 'sent' | 'failed'>('idle');
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
  const exampleCommands = `${nodeCommand}\n${pythonCommand}`;

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopyState(label);
    window.setTimeout(() => setCopyState(''), 1_200);
  };

  const sendCollectorTest = async () => {
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
    <section className="glass-panel p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center border-4 border-slate-950 bg-lime-200 text-slate-950 dark:border-lime-100 dark:bg-lime-300">
          <Play size={22} fill="currentColor" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-slate-600 dark:text-cyan-200">30 秒验证</p>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">先让宠物动起来</h2>
          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-300">
            不确定怎么接入时，按这三个动作走。先看效果，再验证 collector；如果你克隆了 GitHub 仓库，也可以跑 examples。
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-950 dark:text-white">1. 不填 Key 看动画</h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                本地模拟一条 usage，让桌面宠物碎一次钱，然后停住。
              </p>
            </div>
            <button type="button" onClick={onRunQuickStartDemo} className="action-button">
              <Play size={16} />
              <span>一键试玩</span>
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-950 dark:text-white">2. 验证本地 collector</h3>
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
                向 {usageUrl} 发一条测试 usage，确认本机接口能驱动宠物。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void sendCollectorTest()} className="action-button">
                <FlaskConical size={16} />
                <span>{testState === 'sent' ? '已发送' : testState === 'failed' ? '失败' : '发送测试'}</span>
              </button>
              <button type="button" onClick={() => void copy(examples.curlUsage, 'curl 已复制')} className="action-button">
                <Clipboard size={16} />
                <span>{copyState === 'curl 已复制' ? copyState : '复制 curl'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-slate-600 dark:text-cyan-200">
              <Terminal size={14} />
              直接接入代码
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => void copy(examples.curlUsage, 'curl 已复制')} className="action-button">
              <Clipboard size={16} />
              <span>复制 curl</span>
            </button>
            <button type="button" onClick={() => void copy(examples.jsUsage, 'JS 已复制')} className="action-button">
              <Clipboard size={16} />
              <span>复制 JS fetch</span>
            </button>
            <button
              type="button"
              onClick={() => void copy(examples.pythonUsage, 'Python 已复制')}
              className="action-button"
            >
              <Clipboard size={16} />
              <span>复制 Python</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => void copy(examples.agentInstruction, 'Agent 接入说明已复制')}
            className="mt-2 action-button w-full"
          >
            <Clipboard size={16} />
            <span>复制给 ChatGPT / Codex / Agent 的接入说明</span>
          </button>
        </div>

        <div className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase text-cyan-200">
              <Terminal size={14} />
              GitHub source examples
            </span>
            <button type="button" onClick={() => void copy(exampleCommands, '命令已复制')} className="mini-action-button">
              <Clipboard size={14} />
              <span>{copyState === '命令已复制' ? '已复制' : '复制命令'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
            {`# cloned repo only\n${exampleCommands}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
