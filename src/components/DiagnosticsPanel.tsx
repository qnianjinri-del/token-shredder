import { Clipboard, HeartPulse } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildDiagnosticsText } from '../lib/diagnostics';
import type {
  AppState,
  CalculationResult,
  MonitorInfo,
  PetRuntimeState,
  ProviderConfig,
} from '../types';

interface DiagnosticsPanelProps {
  state: AppState;
  result: CalculationResult;
  runtimeState: PetRuntimeState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}

export function DiagnosticsPanel({
  state,
  result,
  runtimeState,
  monitorInfo,
  providerConfig,
}: DiagnosticsPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const diagnosticsText = useMemo(
    () =>
      buildDiagnosticsText({
        state,
        result,
        runtimeState,
        monitorInfo,
        providerConfig,
        userAgent: navigator.userAgent,
      }),
    [monitorInfo, providerConfig, result, runtimeState, state],
  );

  const copyDiagnostics = async () => {
    await navigator.clipboard.writeText(diagnosticsText);
    setCopyStatus('诊断信息已复制');
    window.setTimeout(() => setCopyStatus(''), 1_600);
  };

  return (
    <section id="diagnostics" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
            <HeartPulse size={18} />
            <h2 className="text-base font-black text-slate-950 dark:text-white">问题诊断</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            遇到问题时复制这段给 issue 或朋友。它会隐藏 API Key，也不包含 prompt、completion 或 messages。
          </p>
        </div>
        <button type="button" onClick={() => void copyDiagnostics()} className="action-button">
          <Clipboard size={16} />
          <span>{copyStatus || '复制诊断信息'}</span>
        </button>
      </div>

      <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-xs font-bold leading-relaxed text-slate-100 dark:border-white/10">
        {diagnosticsText}
      </pre>
    </section>
  );
}
