import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { UsageEvent } from './usageNormalizer.js';

export interface CodexRateLimitWindow {
  usedPercent: number | null;
  windowMinutes: number | null;
  resetsAt: number | null;
}

export interface CodexRateLimits {
  primary: CodexRateLimitWindow | null;
  secondary: CodexRateLimitWindow | null;
}

export interface CodexUsageEvent extends UsageEvent {
  codexRateLimits?: CodexRateLimits;
}

export interface CodexMonitorInfo {
  enabled: boolean;
  status: 'watching' | 'missing' | 'error';
  sessionsPath: string;
  lastTokenEventAt?: number;
  error?: string;
  rateLimits?: CodexRateLimits;
}

interface WatcherState {
  knownFiles: Map<string, number>;
  remainders: Map<string, string>;
  interval: NodeJS.Timeout | null;
  initialized: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const numberFrom = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  return 0;
};

const nullableNumberFrom = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const parseRateLimitWindow = (value: unknown): CodexRateLimitWindow | null => {
  if (!isRecord(value)) {
    return null;
  }

  return {
    usedPercent: nullableNumberFrom(value.used_percent),
    windowMinutes: nullableNumberFrom(value.window_minutes),
    resetsAt: nullableNumberFrom(value.resets_at),
  };
};

const parseRateLimits = (value: unknown): CodexRateLimits | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    primary: parseRateLimitWindow(value.primary),
    secondary: parseRateLimitWindow(value.secondary),
  };
};

export const getDefaultCodexSessionsPath = () =>
  path.join(os.homedir(), '.codex', 'sessions');

export const parseCodexTokenCountLine = (line: string): CodexUsageEvent | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line) as unknown;
  } catch {
    return null;
  }

  if (!isRecord(parsed) || parsed.type !== 'event_msg' || !isRecord(parsed.payload)) {
    return null;
  }

  if (parsed.payload.type !== 'token_count' || !isRecord(parsed.payload.info)) {
    return null;
  }

  const lastUsage = isRecord(parsed.payload.info.last_token_usage)
    ? parsed.payload.info.last_token_usage
    : {};
  const rawInputTokens = numberFrom(lastUsage.input_tokens);
  const cachedInputTokens = numberFrom(lastUsage.cached_input_tokens);
  const outputTokens = numberFrom(lastUsage.output_tokens);
  const reasoningTokens = numberFrom(lastUsage.reasoning_output_tokens);
  const inputTokens = Math.max(0, rawInputTokens - cachedInputTokens);
  const timestamp = typeof parsed.timestamp === 'string' ? Date.parse(parsed.timestamp) : Date.now();

  if (inputTokens + cachedInputTokens + outputTokens + reasoningTokens <= 0) {
    return null;
  }

  return {
    id: `codex-${Number.isFinite(timestamp) ? timestamp : Date.now()}-${rawInputTokens}-${outputTokens}-${reasoningTokens}`,
    timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
    source: 'Codex 本地日志',
    scenarioName: 'Codex token 消耗',
    inputTokens,
    outputTokens,
    cachedInputTokens,
    reasoningTokens,
    directCost: 0,
    codexRateLimits: parseRateLimits(parsed.payload.rate_limits),
  };
};

const listJsonlFiles = (directory: string): string[] => {
  const results: string[] = [];

  const walk = (currentDirectory: string) => {
    const entries = fs.readdirSync(currentDirectory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        results.push(entryPath);
      }
    }
  };

  walk(directory);
  return results;
};

const readNewText = (filePath: string, start: number, endExclusive: number) => {
  if (endExclusive <= start) {
    return '';
  }

  const length = endExclusive - start;
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(filePath, 'r');
  try {
    fs.readSync(fd, buffer, 0, length, start);
  } finally {
    fs.closeSync(fd);
  }

  return buffer.toString('utf8');
};

export const createCodexLogWatcher = ({
  sessionsPath = getDefaultCodexSessionsPath(),
  onUsageEvent,
  onInfo,
  pollIntervalMs = 2_000,
}: {
  sessionsPath?: string;
  onUsageEvent: (event: CodexUsageEvent) => void;
  onInfo: (info: CodexMonitorInfo) => void;
  pollIntervalMs?: number;
}) => {
  const state: WatcherState = {
    knownFiles: new Map(),
    remainders: new Map(),
    interval: null,
    initialized: false,
  };

  const info: CodexMonitorInfo = {
    enabled: true,
    status: 'missing',
    sessionsPath,
  };

  const setInfo = (patch: Partial<CodexMonitorInfo>) => {
    Object.assign(info, patch);
    onInfo({ ...info });
  };

  const processFile = (filePath: string, stat: fs.Stats, isNewFile: boolean) => {
    const previousPosition = state.knownFiles.get(filePath);
    const startPosition = previousPosition ?? (state.initialized && isNewFile ? 0 : stat.size);

    state.knownFiles.set(filePath, stat.size);

    if (stat.size <= startPosition) {
      return;
    }

    const chunk = readNewText(filePath, startPosition, stat.size);
    const previousRemainder = state.remainders.get(filePath) ?? '';
    const text = previousRemainder + chunk;
    const endsWithNewline = text.endsWith('\n');
    const lines = text.split(/\r?\n/);
    const completeLines = endsWithNewline ? lines : lines.slice(0, -1);
    const remainder = endsWithNewline ? '' : lines[lines.length - 1] ?? '';

    state.remainders.set(filePath, remainder);

    for (const line of completeLines) {
      if (!line.trim()) {
        continue;
      }

      const event = parseCodexTokenCountLine(line);
      if (!event) {
        continue;
      }

      setInfo({
        status: 'watching',
        lastTokenEventAt: event.timestamp,
        rateLimits: event.codexRateLimits,
        error: undefined,
      });
      onUsageEvent(event);
    }
  };

  const scan = () => {
    if (!fs.existsSync(sessionsPath)) {
      setInfo({ status: 'missing', error: undefined });
      return;
    }

    try {
      const files = listJsonlFiles(sessionsPath);
      setInfo({ status: 'watching', error: undefined });

      for (const filePath of files) {
        const stat = fs.statSync(filePath);
        processFile(filePath, stat, !state.knownFiles.has(filePath));
      }
      state.initialized = true;
    } catch (error) {
      setInfo({
        status: 'error',
        error: error instanceof Error ? error.message : 'Codex 日志监控失败。',
      });
    }
  };

  return {
    start: () => {
      scan();
      state.interval = setInterval(scan, pollIntervalMs);
    },
    stop: () => {
      if (state.interval) {
        clearInterval(state.interval);
        state.interval = null;
      }
    },
    getInfo: () => ({ ...info }),
  };
};
