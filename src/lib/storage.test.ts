import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE } from './presets';
import { mergeState } from './storage';

describe('mergeState', () => {
  it('keeps a valid pet skin from persisted state', () => {
    expect(mergeState({ petSkin: 'doh-dad' }).petSkin).toBe('doh-dad');
    expect(mergeState({ petSkin: 'codex-chomp' }).petSkin).toBe('codex-chomp');
  });

  it('falls back when persisted pet skin is invalid', () => {
    expect(mergeState({ petSkin: 'missing-skin' } as never).petSkin).toBe(DEFAULT_STATE.petSkin);
  });
});
