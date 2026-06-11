import { describe, expect, it } from 'vitest';
import { parseCodexTokenCountLine } from './codexLogWatcher';

describe('codexLogWatcher parser', () => {
  it('extracts Codex token_count events without prompt content', () => {
    const event = parseCodexTokenCountLine(
      JSON.stringify({
        timestamp: '2026-06-09T06:00:00.000Z',
        type: 'event_msg',
        payload: {
          type: 'token_count',
          info: {
            last_token_usage: {
              input_tokens: 28_243,
              cached_input_tokens: 23_936,
              output_tokens: 591,
              reasoning_output_tokens: 450,
              total_tokens: 28_834,
            },
          },
          rate_limits: {
            primary: {
              used_percent: 2,
              window_minutes: 300,
              resets_at: 1_780_000_000,
            },
            secondary: null,
          },
        },
      }),
    );

    expect(event).toMatchObject({
      source: 'Codex 本地日志',
      scenarioName: 'Codex token 消耗',
      inputTokens: 4_307,
      cachedInputTokens: 23_936,
      outputTokens: 591,
      reasoningTokens: 450,
      directCost: 0,
      codexRateLimits: {
        primary: {
          usedPercent: 2,
          windowMinutes: 300,
          resetsAt: 1_780_000_000,
        },
        secondary: null,
      },
    });
  });

  it('ignores non-token-count lines', () => {
    expect(parseCodexTokenCountLine('{"type":"response_item"}')).toBeNull();
    expect(parseCodexTokenCountLine('not json')).toBeNull();
  });
});
