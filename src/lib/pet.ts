import type { PetSkinId } from '../types';

export const PET_SCALE_MIN = 0.5;
export const PET_SCALE_MAX = 1.25;
export const PET_SCALE_STEP = 0.05;
export const PET_SCALE_DEFAULT = 0.72;

export const PET_SKIN_IDS = [
  'shredder',
  'doh-dad',
  'codex-chomp',
  'agent-bot',
  'token-furnace',
] as const satisfies readonly PetSkinId[];

export const PET_SKINS: Array<{ id: PetSkinId; label: string }> = [
  { id: 'shredder', label: '碎钞机' },
  { id: 'doh-dad', label: '刀～爸爸' },
  { id: 'codex-chomp', label: 'Codex 吞钞' },
  { id: 'agent-bot', label: 'Agent 小机器人' },
  { id: 'token-furnace', label: 'Token 小火炉' },
];

export const PET_SKIN_CONCEPTS = [
  {
    id: 'coding-agent-bite',
    label: 'Coding Agent 咬钞',
    status: '构思中',
    description: '原创终端小嘴逐口咬掉 TOKEN BILL。',
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
    id: 'receipt-cannon',
    label: '小票加农炮',
    status: '构思中',
    description: '账单小票被打成 TOKEN 纸带。',
    accent: '#facc15',
  },
] as const;

export const PET_SKIN_DEFAULT: PetSkinId = 'shredder';

export const isPetSkinId = (value: unknown): value is PetSkinId =>
  typeof value === 'string' && (PET_SKIN_IDS as readonly string[]).includes(value);

export const clampPetScale = (value: number): number => {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return PET_SCALE_DEFAULT;
  }

  return Math.min(PET_SCALE_MAX, Math.max(PET_SCALE_MIN, value));
};
