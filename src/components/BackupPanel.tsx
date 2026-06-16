import { Clipboard, Download, RotateCcw, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  createBackupPayload,
  restoreBackupJson,
  stringifyBackupPayload,
} from '../lib/backup';
import type { AppState, ProviderConfig } from '../types';

interface BackupPanelProps {
  state: AppState;
  providerConfig: ProviderConfig;
  onRestore: (state: AppState, providerConfig: ProviderConfig) => void;
}

const downloadTextFile = (filename: string, text: string) => {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export function BackupPanel({ state, providerConfig, onRestore }: BackupPanelProps) {
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState('');
  const backupText = useMemo(
    () => stringifyBackupPayload(createBackupPayload(state, providerConfig)),
    [providerConfig, state],
  );

  const copyBackup = async () => {
    await navigator.clipboard.writeText(backupText);
    setStatus('配置 JSON 已复制，不包含 API Key 或 session 日志。');
    window.setTimeout(() => setStatus(''), 1_800);
  };

  const downloadBackup = () => {
    downloadTextFile('token-shredder-config.json', backupText);
    setStatus('配置 JSON 已下载。');
    window.setTimeout(() => setStatus(''), 1_800);
  };

  const restore = () => {
    try {
      const result = restoreBackupJson(importText);
      onRestore(result.state, result.providerConfig);
      setImportText('');
      setStatus(result.warnings.length ? result.warnings.join(' ') : '配置已恢复。API Key 需要重新填写。');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '导入失败。');
    } finally {
      window.setTimeout(() => setStatus(''), 2_600);
    }
  };

  return (
    <section id="backup" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">配置备份 / 恢复</h2>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            导出价格、皮肤、大小、服务商类型和 Base URL。不会导出 API Key、prompt、completion 或 session usage 日志。
          </p>
        </div>
        <div className="border-4 border-slate-950 bg-cyan-200 px-2 py-1 text-[11px] font-black uppercase text-slate-950 dark:border-cyan-200 dark:bg-cyan-300">
          no secrets
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => void copyBackup()} className="action-button">
          <Clipboard size={16} />
          <span>复制配置 JSON</span>
        </button>
        <button type="button" onClick={downloadBackup} className="action-button">
          <Download size={16} />
          <span>下载配置 JSON</span>
        </button>
      </div>

      <label className="mt-4 block">
        <span className="control-label">粘贴配置 JSON 恢复</span>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="粘贴 token-shredder-config.json 内容"
          className="mt-1 min-h-28 w-full resize-y rounded-lg border-4 border-slate-950 bg-white px-3 py-2 text-xs font-bold text-slate-950 outline-none focus:bg-cyan-50 dark:border-cyan-200 dark:bg-[#0f172a] dark:text-white dark:focus:bg-[#172033]"
        />
      </label>

      <button
        type="button"
        onClick={restore}
        disabled={!importText.trim()}
        className="mt-3 action-button"
      >
        {importText.trim() ? <Upload size={16} /> : <RotateCcw size={16} />}
        <span>恢复配置</span>
      </button>

      {status ? <p className="mt-3 text-sm font-black text-cyan-700 dark:text-cyan-200">{status}</p> : null}
    </section>
  );
}
