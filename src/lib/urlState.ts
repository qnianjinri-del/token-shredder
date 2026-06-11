import type { AppState } from '../types';
import { DEFAULT_STATE } from './presets';
import { mergeState } from './storage';

const URL_STATE_KEY = 'state';

export const readStateFromUrl = (fallback: AppState = DEFAULT_STATE): AppState | null => {
  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_STATE_KEY);
    if (!encoded) {
      return null;
    }

    const parsed = JSON.parse(decodeURIComponent(encoded)) as Partial<AppState>;
    return mergeState(parsed, fallback);
  } catch {
    return null;
  }
};

export const createShareUrl = (state: AppState): string => {
  const url = new URL(window.location.href);
  const shareState: AppState = {
    ...state,
    theme: state.theme,
  };

  url.searchParams.set(URL_STATE_KEY, encodeURIComponent(JSON.stringify(shareState)));
  return url.toString();
};
