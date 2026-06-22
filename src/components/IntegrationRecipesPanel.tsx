import { Bot, Clipboard, Code2, FileCode2, ListChecks, PlugZap, TerminalSquare } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createIntegrationExamples } from '../lib/integrationExamples';
import type { MonitorInfo, ProviderConfig } from '../types';

interface IntegrationRecipesPanelProps {
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}

const proxyBaseUrlFrom = (monitorInfo: MonitorInfo) =>
  monitorInfo.port ? `http://${monitorInfo.host}:${monitorInfo.port}/v1` : 'http://127.0.0.1:17391/v1';

export function IntegrationRecipesPanel({
  monitorInfo,
  providerConfig,
}: IntegrationRecipesPanelProps) {
  const [copyStatus, setCopyStatus] = useState('');
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

  const recipes = [
    {
      title: '脚本直接 POST usage',
      description: '适合你的脚本已经知道 input/output/cached/reasoning token 数。',
      icon: TerminalSquare,
      code: examples.curlUsage,
    },
    {
      title: 'JavaScript fetch',
      description: '适合 Node.js、浏览器扩展或本地自动化脚本。',
      icon: Code2,
      code: examples.jsUsage,
    },
    {
      title: 'Python requests',
      description: '适合 Python agent、爬虫、批处理或 notebook。',
      icon: FileCode2,
      code: examples.pythonUsage,
    },
    {
      title: 'JavaScript reporter helper',
      description: '复制到项目里，模型响应回来后自动把 OpenAI-style usage 上报给 Token Shredder。',
      icon: Code2,
      code: examples.jsReporterHelper,
    },
    {
      title: 'Python reporter helper',
      description: '复制到 Python 项目里，自动从 OpenAI-style response 里提取 usage 并上报。',
      icon: FileCode2,
      code: examples.pythonReporterHelper,
    },
    {
      title: 'OpenAI SDK 本机代理',
      description: '适合 OpenAI-compatible 客户端，把 baseURL 指到本机。',
      icon: PlugZap,
      code: examples.openAiSdkProxy,
    },
    {
      title: '给 Codex / ChatGPT 的接入提示词',
      description: '把这段发给 coding agent，让它帮你把当前项目接入 Token Shredder。',
      icon: Bot,
      code: examples.agentImplementationPrompt,
    },
    {
      title: 'Provider 字段清单',
      description: '适合你正在填写后台配置，但不知道需要准备哪些信息。',
      icon: ListChecks,
      code: examples.providerFieldChecklist,
    },
  ];

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopyStatus(`${label} 已复制`);
    window.setTimeout(() => setCopyStatus(''), 1_400);
  };

  return (
    <section id="recipes" className="glass-panel scroll-mt-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">接入配方</h2>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            不同工具拿 usage 的方式不一样。这里给出几种可以直接复制的起点。
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copy(examples.agentImplementationPrompt, 'AI 接入提示词')}
          className="action-button"
        >
          <Clipboard size={16} />
          <span>复制给 Codex/ChatGPT</span>
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {recipes.map((recipe) => {
          const Icon = recipe.icon;

          return (
            <article
              key={recipe.title}
              className="rounded-lg border border-slate-300/70 bg-slate-950 p-3 text-white dark:border-white/10"
            >
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="inline-flex items-center gap-2 text-sm font-black text-cyan-100">
                    <Icon size={16} />
                    {recipe.title}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-300">{recipe.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void copy(recipe.code, recipe.title)}
                  className="mini-action-button"
                >
                  <Clipboard size={14} />
                  <span>复制</span>
                </button>
              </div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs font-bold leading-relaxed text-slate-100">
                {recipe.code}
              </pre>
            </article>
          );
        })}
      </div>

      {copyStatus ? <p className="mt-3 text-sm font-black text-cyan-700 dark:text-cyan-200">{copyStatus}</p> : null}
    </section>
  );
}
