import type { DemoMode, PetRuntimeState } from '../types';

interface RuntimeStateInput {
  demoMode: DemoMode;
  hasUsageEvents: boolean;
  isReceivingUsage: boolean;
}

export const derivePetRuntimeState = ({
  demoMode,
  hasUsageEvents,
  isReceivingUsage,
}: RuntimeStateInput): PetRuntimeState => {
  if (demoMode === 'always') {
    return 'demo';
  }

  if (!hasUsageEvents) {
    return demoMode === 'off' ? 'empty' : 'demo';
  }

  return isReceivingUsage ? 'active-real' : 'idle-real';
};

export const runtimeStateLabel: Record<PetRuntimeState, string> = {
  demo: '演示中',
  empty: '等待接入',
  'active-real': '正在接收 usage',
  'idle-real': '真实监控中',
};

export const runtimeStateDescription: Record<PetRuntimeState, string> = {
  demo: '当前动画为演示，不代表真实成本。',
  empty: '发送一条 usage 到本机接口后，宠物会开始真实碎钱。',
  'active-real': '检测到新 token 消耗，宠物正在碎钱。',
  'idle-real': '宠物停在当前真实成本进度，等待下一次 usage。',
};
