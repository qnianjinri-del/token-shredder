import { toPng } from 'html-to-image';
import { Copy, Download, Link, MessageSquareText } from 'lucide-react';
import { useRef, useState } from 'react';
import type { AppState, CalculationResult } from '../types';
import {
  buildChineseLaunchPost,
  buildEnglishLaunchPost,
  buildSummaryText,
} from '../lib/shareText';
import { createShareUrl } from '../lib/urlState';
import { SummaryCard } from './SummaryCard';

interface SharePanelProps {
  state: AppState;
  result: CalculationResult;
}

const fileNameFromScenario = (scenarioName: string): string => {
  const slug = scenarioName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug || 'token-shredder'}-share-card.png`;
};

const writeClipboardText = async (value: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
  } catch {
    // Fall through to the textarea copy path for browsers with strict clipboard permissions.
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const didCopy = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!didCopy) {
    throw new Error('Copy command failed');
  }
};

export function SharePanel({ state, result }: SharePanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const copyText = async (value: string, message: string) => {
    try {
      await writeClipboardText(value);
      setStatus(message);
    } catch {
      setStatus('复制失败。');
    }

    window.setTimeout(() => setStatus(''), 1800);
  };

  const handleDownload = async () => {
    if (!cardRef.current) {
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: state.theme === 'dark' ? '#020617' : '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = fileNameFromScenario(state.scenarioName);
      link.href = dataUrl;
      link.click();
      setStatus('PNG 已下载。');
    } catch {
      setStatus('PNG 导出失败。');
    } finally {
      setIsExporting(false);
      window.setTimeout(() => setStatus(''), 2200);
    }
  };

  return (
    <section className="glass-panel p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950 dark:text-white">分享</h2>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            复制摘要、传播帖，或导出分享卡片。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText(buildSummaryText(state, result), '摘要已复制。')}
            className="action-button"
          >
            <Copy size={16} />
            <span>复制摘要</span>
          </button>
          <button
            type="button"
            onClick={() => void copyText(buildEnglishLaunchPost(state, result), '英文传播帖已复制。')}
            className="action-button"
          >
            <MessageSquareText size={16} />
            <span>复制英文帖</span>
          </button>
          <button
            type="button"
            onClick={() => void copyText(buildChineseLaunchPost(state, result), '中文传播帖已复制。')}
            className="action-button"
          >
            <MessageSquareText size={16} />
            <span>复制中文帖</span>
          </button>
          <button
            type="button"
            onClick={() => void copyText(createShareUrl(state), '分享链接已复制。')}
            className="action-button"
          >
            <Link size={16} />
            <span>复制分享链接</span>
          </button>
          <button type="button" onClick={() => void handleDownload()} className="action-button" disabled={isExporting}>
            <Download size={16} />
            <span>{isExporting ? '导出中' : '下载分享卡片'}</span>
          </button>
        </div>
      </div>
      {status ? <div className="mt-3 text-sm font-bold text-cyan-700 dark:text-cyan-200">{status}</div> : null}
      <div className="mt-4 overflow-x-auto pb-1">
        <SummaryCard ref={cardRef} state={state} result={result} />
      </div>
    </section>
  );
}
