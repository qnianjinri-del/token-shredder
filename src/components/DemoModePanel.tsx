import type { DemoMode } from '../types';

interface DemoModePanelProps {
  demoMode: DemoMode;
  onDemoModeChange: (mode: DemoMode) => void;
}

const modes: Array<{ value: DemoMode; label: string; description: string }> = [
  {
    value: 'auto',
    label: '自动',
    description: '需要展示或录屏时使用：没有真实 usage 时演示，收到真实 usage 后停止伪造动画。',
  },
  {
    value: 'always',
    label: '永远演示',
    description: '一直播放演示动画，不代表真实成本。',
  },
  {
    value: 'off',
    label: '关闭演示',
    description: '没有真实 usage 时宠物静止，等待接入。',
  },
];

export function DemoModePanel({ demoMode, onDemoModeChange }: DemoModePanelProps) {
  return (
    <section className="glass-panel p-4">
      <h2 className="text-base font-black text-slate-950 dark:text-white">演示模式</h2>
      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        默认关闭演示。首次打开时宠物会等待真实 usage，不会假装已经产生费用。
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onDemoModeChange(mode.value)}
            className={`mode-button min-h-10 px-2 py-1 text-xs ${demoMode === mode.value ? 'mode-button-active' : ''}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs font-bold text-slate-600 dark:text-slate-300">
        {modes.find((mode) => mode.value === demoMode)?.description}
      </p>
    </section>
  );
}
