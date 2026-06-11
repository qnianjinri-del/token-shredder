import type { PetSkinId } from '../types';

export const PET_SCALE_MIN = 0.5;
export const PET_SCALE_MAX = 1.25;
export const PET_SCALE_STEP = 0.05;
export const PET_SCALE_DEFAULT = 0.72;

export const PET_SKINS: Array<{ id: PetSkinId; label: string }> = [
  { id: 'shredder', label: '碎钞机' },
  { id: 'doh-dad', label: '刀～爸爸' },
  { id: 'codex-chomp', label: 'Codex 吞钞' },
];

export const PET_SKIN_CONCEPTS = [
  {
    id: 'claude-code-bite',
    label: 'Claude Code 咬钞',
    status: '构思中',
    description: '橙白标志折成小嘴，逐口咬掉美元。',
    accent: '#f97316',
  },
  {
    id: 'token-black-hole',
    label: 'Token 黑洞',
    status: '构思中',
    description: '美元被像素旋涡卷走，吐出 token 碎片。',
    accent: '#22d3ee',
  },
  {
    id: 'ide-monster',
    label: 'IDE 怪窗口',
    status: '构思中',
    description: '代码编辑器长出嘴，tab 栏吞掉预算。',
    accent: '#a78bfa',
  },
  {
    id: 'rate-limit-siren',
    label: 'Rate Limit 警报',
    status: '构思中',
    description: '警灯越转越快，美元进度条一点点烧完。',
    accent: '#f43f5e',
  },
  {
    id: 'agent-bot',
    label: 'Agent 小机器人',
    status: '构思中',
    description: '原创机器人啃美元，肚子屏幕显示余额。',
    accent: '#facc15',
  },
] as const;

export const PET_SKIN_DEFAULT: PetSkinId = 'shredder';

export const isPetSkinId = (value: unknown): value is PetSkinId =>
  value === 'shredder' || value === 'doh-dad' || value === 'codex-chomp';

export const clampPetScale = (value: number): number => {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return PET_SCALE_DEFAULT;
  }

  return Math.min(PET_SCALE_MAX, Math.max(PET_SCALE_MIN, value));
};
