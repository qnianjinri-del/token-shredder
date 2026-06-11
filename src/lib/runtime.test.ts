import { describe, expect, it } from 'vitest';
import { derivePetRuntimeState } from './runtime';

describe('derivePetRuntimeState', () => {
  it('uses demo mode automatically before real usage', () => {
    expect(
      derivePetRuntimeState({
        demoMode: 'auto',
        hasUsageEvents: false,
        isReceivingUsage: false,
      }),
    ).toBe('demo');
  });

  it('uses empty when demo mode is off and there is no usage', () => {
    expect(
      derivePetRuntimeState({
        demoMode: 'off',
        hasUsageEvents: false,
        isReceivingUsage: false,
      }),
    ).toBe('empty');
  });

  it('switches between active and idle real monitoring', () => {
    expect(
      derivePetRuntimeState({
        demoMode: 'auto',
        hasUsageEvents: true,
        isReceivingUsage: true,
      }),
    ).toBe('active-real');
    expect(
      derivePetRuntimeState({
        demoMode: 'auto',
        hasUsageEvents: true,
        isReceivingUsage: false,
      }),
    ).toBe('idle-real');
  });

  it('allows always-demo mode to override real usage display', () => {
    expect(
      derivePetRuntimeState({
        demoMode: 'always',
        hasUsageEvents: true,
        isReceivingUsage: false,
      }),
    ).toBe('demo');
  });
});
