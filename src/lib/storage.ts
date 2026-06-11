import type { AppState } from '../types';
import { clampPetScale, isPetSkinId } from './pet';
import { DEFAULT_STATE } from './presets';

const STORAGE_KEY = 'token-shredder:state:v2';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const mergeState = (candidate: Partial<AppState>, fallback: AppState = DEFAULT_STATE): AppState => ({
  ...fallback,
  ...candidate,
  petScale: clampPetScale(
    typeof candidate.petScale === 'number' ? candidate.petScale : fallback.petScale,
  ),
  petSkin: isPetSkinId(candidate.petSkin) ? candidate.petSkin : fallback.petSkin,
  pricing: {
    ...fallback.pricing,
    ...(isRecord(candidate.pricing) ? candidate.pricing : {}),
  },
  usage: {
    ...fallback.usage,
    ...(isRecord(candidate.usage) ? candidate.usage : {}),
  },
  monitoring: {
    ...fallback.monitoring,
    ...(isRecord(candidate.monitoring) ? candidate.monitoring : {}),
    events: Array.isArray(candidate.monitoring?.events)
      ? candidate.monitoring.events
      : fallback.monitoring.events,
    directCostTotal:
      isRecord(candidate.monitoring) && typeof candidate.monitoring.directCostTotal === 'number'
        ? candidate.monitoring.directCostTotal
        : fallback.monitoring.directCostTotal,
  },
  demoMode:
    candidate.demoMode === 'auto' || candidate.demoMode === 'always' || candidate.demoMode === 'off'
      ? candidate.demoMode
      : fallback.demoMode,
  onboardingComplete:
    typeof candidate.onboardingComplete === 'boolean'
      ? candidate.onboardingComplete
      : fallback.onboardingComplete,
});

export const loadStoredState = (): AppState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return mergeState(parsed);
  } catch {
    return null;
  }
};

export const saveStoredState = (state: AppState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing; the app still works without persistence.
  }
};

export const clearStoredState = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op.
  }
};
