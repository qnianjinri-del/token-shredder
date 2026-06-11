import { Maximize2, Minimize2 } from 'lucide-react';
import { PET_SCALE_MAX, PET_SCALE_MIN, PET_SCALE_STEP, clampPetScale } from '../lib/pet';

interface PetSizePanelProps {
  petScale: number;
  onPetScaleChange: (value: number) => void;
}

const presets = [
  { label: '迷你', value: 0.55 },
  { label: '小', value: 0.72 },
  { label: '标准', value: 1 },
];

export function PetSizePanel({ petScale, onPetScaleChange }: PetSizePanelProps) {
  const safeScale = clampPetScale(petScale);
  const percent = Math.round(safeScale * 100);

  return (
    <section className="glass-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950 dark:text-white">桌面宠物大小</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            调完会实时保存，桌面宠物窗口也会跟着变化。
          </p>
        </div>
        <div className="border-4 border-slate-950 bg-cyan-200 px-2 py-1 text-sm font-black text-slate-950 dark:border-cyan-200 dark:bg-cyan-300">
          {percent}%
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Minimize2 size={16} className="text-slate-600 dark:text-cyan-200" />
        <input
          type="range"
          min={PET_SCALE_MIN}
          max={PET_SCALE_MAX}
          step={PET_SCALE_STEP}
          value={safeScale}
          onChange={(event) => onPetScaleChange(clampPetScale(Number(event.target.value)))}
          className="h-3 min-w-0 flex-1 cursor-pointer accent-cyan-400"
          aria-label="桌面宠物大小"
        />
        <Maximize2 size={16} className="text-slate-600 dark:text-cyan-200" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPetScaleChange(preset.value)}
            className={`mode-button min-h-9 px-2 py-1 text-xs ${Math.abs(safeScale - preset.value) < 0.02 ? 'mode-button-active' : ''}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
