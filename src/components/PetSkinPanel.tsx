import { Bot, CircleDotDashed, Code2, Palette, Siren } from 'lucide-react';
import { PET_SKIN_CONCEPTS, PET_SKINS } from '../lib/pet';
import type { PetSkinId } from '../types';

interface PetSkinPanelProps {
  petSkin: PetSkinId;
  onPetSkinChange: (value: PetSkinId) => void;
}

const machineUrl = () => `${import.meta.env.BASE_URL}assets/shredder-machine-tight.png`;

const dohDadSpriteUrl = () => `${import.meta.env.BASE_URL}assets/skins/doh-dad-burn-spritesheet.png`;

const codexChompSpriteUrl = () => `${import.meta.env.BASE_URL}assets/skins/codex-chomp-spritesheet.png`;

const conceptIconMap = {
  'claude-code-bite': Code2,
  'token-black-hole': CircleDotDashed,
  'ide-monster': Code2,
  'rate-limit-siren': Siren,
  'agent-bot': Bot,
} as const;

export function PetSkinPanel({ petSkin, onPetSkinChange }: PetSkinPanelProps) {
  return (
    <section className="glass-panel p-4">
      <div className="flex items-center gap-2">
        <Palette size={16} className="text-slate-600 dark:text-cyan-200" />
        <h2 className="text-base font-black text-slate-950 dark:text-white">更换桌面宠物皮肤</h2>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
        点击已安装皮肤会立刻保存，并同步到桌面上的小宠物。
      </p>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="control-label">已安装</span>
        <span className="border-2 border-slate-950 bg-cyan-200 px-2 py-0.5 text-[10px] font-black text-slate-950 dark:border-cyan-200 dark:bg-cyan-300">
          {PET_SKINS.length}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {PET_SKINS.map((skin) => (
          <button
            key={skin.id}
            type="button"
            onClick={() => onPetSkinChange(skin.id)}
            className={`mode-button min-h-[116px] flex-col px-2 py-3 text-xs ${petSkin === skin.id ? 'mode-button-active' : ''}`}
          >
            <span className="grid h-16 w-full place-items-center overflow-hidden">
              {skin.id === 'doh-dad' ? (
                <span
                  className="h-16 w-12 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${dohDadSpriteUrl()})`,
                    backgroundPosition: '0 0',
                    backgroundSize: '600% 100%',
                    imageRendering: 'pixelated',
                  }}
                />
              ) : skin.id === 'codex-chomp' ? (
                <span
                  className="h-16 w-12 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${codexChompSpriteUrl()})`,
                    backgroundPosition: '0 0',
                    backgroundSize: '600% 100%',
                    imageRendering: 'pixelated',
                  }}
                />
              ) : (
                <img
                  src={machineUrl()}
                  alt=""
                  className="h-16 w-14 object-contain [image-rendering:pixelated]"
                  draggable={false}
                />
              )}
            </span>
            <span>{skin.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <span className="control-label">皮肤工坊</span>
        <span className="border-2 border-slate-950 bg-amber-200 px-2 py-0.5 text-[10px] font-black text-slate-950 dark:border-amber-200 dark:bg-amber-300">
          CONCEPT
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {PET_SKIN_CONCEPTS.map((concept) => {
          const Icon = conceptIconMap[concept.id];

          return (
            <article
              key={concept.id}
              className="border-4 border-slate-950 bg-white p-3 text-slate-950 shadow-[4px_4px_0_rgba(15,23,42,0.82)] dark:border-cyan-200 dark:bg-[#111827] dark:text-white dark:shadow-[4px_4px_0_rgba(103,232,249,0.22)]"
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center border-4 border-slate-950 bg-slate-950 text-white dark:border-cyan-200"
                  style={{ color: concept.accent }}
                >
                  <Icon size={20} strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-black">{concept.label}</h3>
                    <span className="border-2 border-slate-950 bg-[#fff9db] px-1.5 py-0.5 text-[9px] font-black text-slate-950 dark:border-cyan-200 dark:bg-[#182034] dark:text-cyan-100">
                      {concept.status}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-bold leading-snug text-slate-600 dark:text-slate-300">
                    {concept.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
