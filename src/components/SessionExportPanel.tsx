import { Clipboard, Download, FileJson, Table, Text } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  createSessionExportPayload,
  stringifySessionCsv,
  stringifySessionJson,
  stringifySessionMarkdown,
} from '../lib/sessionExport';
import type { AppState, CalculationResult } from '../types';

interface SessionExportPanelProps {
  state: AppState;
  result: CalculationResult;
}

const safeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'token-shredder-session';

const downloadText = (filename: string, text: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function SessionExportPanel({ state, result }: SessionExportPanelProps) {
  const [status, setStatus] = useState('');
  const payload = useMemo(() => createSessionExportPayload(state, result), [result, state]);
  const exports = useMemo(
    () => ({
      json: stringifySessionJson(payload),
      csv: stringifySessionCsv(payload),
      markdown: stringifySessionMarkdown(payload),
    }),
    [payload],
  );
  const slug = safeSlug(state.scenarioName);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setStatus(`${label} 已复制`);
    window.setTimeout(() => setStatus(''), 1_500);
  };

  const download = (extension: 'json' | 'csv' | 'md', value: string, type: string) => {
    downloadText(`${slug}.${extension}`, value, type);
    setStatus(`${extension.toUpperCase()} 已下载`);
    window.setTimeout(() => setStatus(''), 1_500);
  };

  return (
    <section className="glass-panel p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">Session 导出</h2>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            导出当前 session 的成本摘要和 usage 事件。不会包含 prompt、completion、messages 或 API Key。
          </p>
        </div>
        <div className="border-4 border-slate-950 bg-lime-200 px-2 py-1 text-[11px] font-black uppercase text-slate-950 dark:border-lime-100 dark:bg-lime-300">
          {payload.events.length} events
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <button type="button" onClick={() => void copy(exports.json, 'JSON')} className="action-button">
          <Clipboard size={16} />
          <FileJson size={16} />
          <span>复制 JSON</span>
        </button>
        <button
          type="button"
          onClick={() => download('json', exports.json, 'application/json;charset=utf-8')}
          className="action-button"
        >
          <Download size={16} />
          <FileJson size={16} />
          <span>下载 JSON</span>
        </button>
        <button type="button" onClick={() => void copy(exports.csv, 'CSV')} className="action-button">
          <Clipboard size={16} />
          <Table size={16} />
          <span>复制 CSV</span>
        </button>
        <button
          type="button"
          onClick={() => download('csv', exports.csv, 'text/csv;charset=utf-8')}
          className="action-button"
        >
          <Download size={16} />
          <Table size={16} />
          <span>下载 CSV</span>
        </button>
        <button type="button" onClick={() => void copy(exports.markdown, 'Markdown')} className="action-button">
          <Clipboard size={16} />
          <Text size={16} />
          <span>复制 Markdown</span>
        </button>
        <button
          type="button"
          onClick={() => download('md', exports.markdown, 'text/markdown;charset=utf-8')}
          className="action-button"
        >
          <Download size={16} />
          <Text size={16} />
          <span>下载 Markdown</span>
        </button>
      </div>

      {status ? <p className="mt-3 text-sm font-black text-cyan-700 dark:text-cyan-200">{status}</p> : null}
    </section>
  );
}
