import { CheckCircle2, Circle, ExternalLink, ListChecks } from 'lucide-react';
import type { AppState, MonitorInfo, ProviderConfig } from '../types';

interface SetupChecklistPanelProps {
  state: AppState;
  monitorInfo: MonitorInfo;
  providerConfig: ProviderConfig;
}

interface ChecklistItem {
  label: string;
  description: string;
  done: boolean;
  href?: string;
}

const hasProviderBasics = (providerConfig: ProviderConfig) =>
  Boolean(
    providerConfig.apiKey.trim() &&
      providerConfig.upstreamBaseUrl.trim() &&
      providerConfig.model.trim(),
  );

export function SetupChecklistPanel({
  state,
  monitorInfo,
  providerConfig,
}: SetupChecklistPanelProps) {
  const items: ChecklistItem[] = [
    {
      label: '本地服务已运行',
      description: monitorInfo.status === 'running' ? monitorInfo.usageUrl : '等待 collector 启动',
      done: monitorInfo.status === 'running',
    },
    {
      label: '已经看过宠物效果',
      description: '点过一键试玩，或已经收到真实 usage。',
      done: state.monitoring.events.length > 0,
      href: '#start-here',
    },
    {
      label: '价格已确认',
      description: '示例价格可用来体验；正式估算前请按实际 provider 价格填写。',
      done:
        state.pricing.inputPricePerMillion > 0 ||
        state.pricing.outputPricePerMillion > 0 ||
        state.pricing.cachedInputPricePerMillion > 0 ||
        state.pricing.reasoningPricePerMillion > 0,
      href: '#pricing',
    },
    {
      label: '选择接入方式',
      description: hasProviderBasics(providerConfig)
        ? '本机代理必要字段已填写。'
        : '可走本机代理，也可直接 POST usage。',
      done: hasProviderBasics(providerConfig) || monitorInfo.status === 'running',
      href: hasProviderBasics(providerConfig) ? '#provider-setup' : '#monitoring',
    },
    {
      label: '桌面皮肤已选择',
      description: `当前皮肤：${state.petSkin}`,
      done: Boolean(state.petSkin),
      href: '#pet-skins',
    },
    {
      label: '可以备份配置',
      description: '导出的配置不包含 API Key 或 session usage 日志。',
      done: false,
      href: '#backup',
    },
  ];
  const doneCount = items.filter((item) => item.done).length;

  return (
    <section className="glass-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-200">
            <ListChecks size={18} />
            <h2 className="text-base font-black text-slate-950 dark:text-white">新手任务清单</h2>
          </div>
          <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            从第一次打开到真实接入，按这个清单走就够了。
          </p>
        </div>
        <div className="border-4 border-slate-950 bg-lime-200 px-3 py-1 text-sm font-black text-slate-950 dark:border-lime-100 dark:bg-lime-300">
          {doneCount}/{items.length}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((item) => {
          const content = (
            <>
              <span
                className={`mt-0.5 shrink-0 ${item.done ? 'text-lime-700 dark:text-lime-200' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {item.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 text-sm font-black text-slate-950 dark:text-white">
                  {item.label}
                  {item.href ? <ExternalLink size={13} /> : null}
                </span>
                <span className="mt-1 block break-words text-xs font-bold text-slate-600 dark:text-slate-300">
                  {item.description}
                </span>
              </span>
            </>
          );

          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              className="flex gap-3 rounded-lg border border-slate-300/70 bg-white/70 p-3 no-underline transition hover:bg-cyan-50 dark:border-white/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
            >
              {content}
            </a>
          ) : (
            <div
              key={item.label}
              className="flex gap-3 rounded-lg border border-slate-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
