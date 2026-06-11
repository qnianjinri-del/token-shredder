import { ExternalLink, SlidersHorizontal } from 'lucide-react';
import type { ThemeMode } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenSetup: () => void;
}

export function Header({ theme, onToggleTheme, onOpenSetup }: HeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-normal text-slate-950 dark:text-white sm:text-3xl">
          Token Shredder
        </h1>
        <p className="mt-1 text-xs font-black uppercase text-slate-600 dark:text-cyan-200">
          像素桌面宠物，看着 token 预算被一点点碎掉。
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={onOpenSetup} className="action-button">
          <SlidersHorizontal size={16} />
          <span>设置</span>
        </button>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <a
          href="https://github.com/qnianjinri-del/token-shredder"
          target="_blank"
          rel="noreferrer"
          className="action-button"
        >
          <ExternalLink size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </header>
  );
}
