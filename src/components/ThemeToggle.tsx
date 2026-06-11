import { Moon, Sun } from 'lucide-react';
import type { ThemeMode } from '../types';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="action-button"
      aria-label={isDark ? '切换到亮色主题' : '切换到暗色主题'}
    >
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
      <span>{isDark ? '暗色' : '亮色'}</span>
    </button>
  );
}
