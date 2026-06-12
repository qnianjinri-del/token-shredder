# Token Shredder

A tiny desktop pet that shreds your AI token spending in real time.

> Stop pretending tokens are free. Watch your AI agent shred dollars in real time.

![Token Shredder demo animation](docs/assets/token-shredder-demo.gif)

Token Shredder is a local-first Electron desktop pet. Configure your provider key, base URL, model ID, and editable sample token prices, then point your OpenAI-compatible client at the local proxy. The pixel pet turns real token spend into shredded TOKEN blocks.

It started as a small, slightly ridiculous tool for making AI costs feel visible. It is useful today, but still early. I am not a professional developer, so the code, UX, packaging, and integrations will all benefit from sharper eyes.

No cloud backend. No hosted account. No prompt or completion logging. API keys stay on your machine.

![Token Shredder installed skins](docs/assets/token-shredder-skins.png)

## Try It

- Download the macOS v0.1.0 build from [GitHub Releases](https://github.com/qnianjinri-del/token-shredder/releases/tag/v0.1.0).
- Read the launch copy and demo checklist in [docs/LAUNCH_KIT.md](docs/LAUNCH_KIT.md).
- If the idea made you smile or saved you from ignoring token costs again, a Star helps other people find it.

## Help Wanted

Contributions, bug reports, skin ideas, privacy reviews, and small cleanup PRs are very welcome. Good first places to help:

- Record a real demo GIF on macOS.
- Add more original pet skins.
- Test Windows / Linux behavior.
- Improve provider setup docs.
- Review the local-first privacy model.

See [CONTRIBUTING.md](CONTRIBUTING.md), [open issues](https://github.com/qnianjinri-del/token-shredder/issues), and [Discussions](https://github.com/qnianjinri-del/token-shredder/discussions).

## Features

- Transparent always-on-top pixel desktop pet.
- Chinese right-click menu: enter backstage, reset local config, or quit.
- Switchable pixel pet skins.
- Local realtime collector on `127.0.0.1`.
- Local Codex session watcher that reads only `token_count` events from `~/.codex/sessions`.
- Beginner setup flow for API Key, upstream Base URL, model / endpoint ID, and pricing.
- Basic OpenAI-compatible local proxy at `/v1`.
- `GET /health`, `POST /usage`, `DELETE /usage`, and local `/v1/chat/completions`.
- Native Token Shredder usage JSON and common OpenAI-style `usage` payloads.
- Cached token handling that avoids double-charging OpenAI-style `prompt_tokens`.
- Editable sample pricing for input, output, cached input, and reasoning tokens.
- Backstage status, actual local port, connection examples, event log, cost breakdown, and pet size.
- Codex rate limit percentages when Codex writes them to local token count events.
- Demo mode: off by default, with auto and always-on options for demos.
- First-run onboarding card focused on the necessary setup fields.
- Local storage restore.
- Vitest and ESLint coverage for core cost, usage normalization, proxy helpers, runtime state, and port selection.

## Download / Install

v0.1.0 targets macOS first.

Download from [GitHub Releases](https://github.com/qnianjinri-del/token-shredder/releases/tag/v0.1.0). The first public build is an unsigned macOS `.dmg` plus `.zip`, so macOS may show a warning when opening it. Build from source if you prefer to inspect and run the app locally.

Platform status:

- macOS: primary target.
- Windows: planned / experimental.
- Linux: planned / experimental.

## Quick Start

```bash
npm install
npm run dev:desktop
```

On first launch, the backstage window opens automatically for setup. Later, right-click the desktop pet and choose `进入后台` to open it again.

On first launch the pet waits quietly. Open backstage, then fill the required setup:

1. API Key from your provider.
2. Upstream Base URL, for example your OpenAI-compatible provider endpoint.
3. Model / endpoint ID.
4. Token prices in the pricing panel.

Click `保存并启用`, then `发送测试请求`. If your provider returns usage, the pet will briefly shred a bill and the session log will update.

To run the built app locally:

```bash
npm run start:desktop
```

## Connect Your Agent

The easiest path is the local OpenAI-compatible proxy. Token Shredder prefers port `17391`; if it is occupied, it tries `17392` through `17400`. The backstage window always shows the actual port.

### Option 1: Local OpenAI-Compatible Proxy

After filling the beginner setup panel, set your client `baseURL` to:

```txt
http://127.0.0.1:17391/v1
```

Example with the OpenAI JavaScript SDK:

```ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "token-shredder-local",
  baseURL: "http://127.0.0.1:17391/v1",
});

const response = await client.chat.completions.create({
  model: "your-model-or-endpoint-id",
  messages: [{ role: "user", content: "hello" }],
});

console.log(response.choices[0]?.message?.content);
```

`token-shredder-local` is a placeholder key. The desktop app injects the provider key you configured locally. If your client sends a real `Authorization` header instead, Token Shredder passes that through.

Streaming requests are passed through, but v0.1.0 does not guarantee usage extraction from streaming responses.

### Option 2: POST /usage

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"my-agent","scenarioName":"repo cleanup","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'
```

### Option 3: OpenAI-Style Usage

```ts
await fetch("http://127.0.0.1:17391/usage", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    source: "openai-compatible-client",
    usage: {
      prompt_tokens: 120000,
      completion_tokens: 45000,
      prompt_tokens_details: { cached_tokens: 30000 },
      completion_tokens_details: { reasoning_tokens: 8000 },
    },
  }),
});
```

When `prompt_tokens` includes `cached_tokens`, Token Shredder calculates ordinary input tokens as `prompt_tokens - cached_tokens`.

### Option 4: Python

```python
import requests

requests.post("http://127.0.0.1:17391/usage", json={
    "source": "my-python-agent",
    "scenarioName": "repo cleanup",
    "inputTokens": 120000,
    "outputTokens": 45000,
    "cachedInputTokens": 30000,
    "reasoningTokens": 8000,
})
```

The direct `/usage` path is still useful for scripts, agents, and tools that can report token counts themselves.

### Option 5: Codex Local Monitoring

If Codex Desktop / CLI writes local session logs under `~/.codex/sessions`, Token Shredder watches only new `token_count` lines after the app starts.

When Codex records a new token count event:

- Token Shredder converts `last_token_usage` into a local usage event.
- Cached input tokens are separated from ordinary input tokens.
- The pet briefly shreds money according to your configured prices.
- Backstage shows Codex rate limit percentages when present.

This is not an official billing dashboard and does not read prompt or completion content.

## Local API

### GET /health

```bash
curl http://127.0.0.1:17391/health
```

Example response:

```json
{
  "ok": true,
  "app": "Token Shredder",
  "version": "0.1.0",
  "port": 17391,
  "sessionActive": false,
  "receivedUsageEvents": 0,
  "endpoint": "http://127.0.0.1:17391/usage",
  "proxyBaseUrl": "http://127.0.0.1:17391/v1",
  "proxyEnabled": false,
  "codexMonitor": {
    "enabled": true,
    "status": "watching",
    "sessionsPath": "/Users/you/.codex/sessions"
  }
}
```

### POST /v1/chat/completions

Forwards a non-streaming OpenAI-compatible request to your configured upstream, returns the upstream response, and extracts `usage` when present.

Supported basic routes:

- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/completions`
- `POST /v1/embeddings`

### POST /usage

Accepts token counts or direct cost. Missing, negative, and invalid numeric values are treated as `0`.

```json
{
  "source": "my-agent",
  "scenarioName": "repo cleanup",
  "inputTokens": 120000,
  "outputTokens": 45000,
  "cachedInputTokens": 30000,
  "reasoningTokens": 8000,
  "directCost": 0
}
```

### DELETE /usage

Clears the current session:

```bash
curl -X DELETE http://127.0.0.1:17391/usage
```

## Pricing

All prices are editable sample values. They are not official, live, guaranteed, or provider-maintained prices.

Configure:

- Input price / 1M tokens
- Output price / 1M tokens
- Cached input price / 1M tokens
- Reasoning token price / 1M tokens

Use your actual model pricing, contract, dashboard, or provider documentation before relying on cost estimates.

## Privacy

Token Shredder is local-first.

- The desktop app runs on your machine.
- The collector listens on `127.0.0.1`.
- By default, it records token counts, source names, scenario names, timestamps, and local cost estimates.
- The Codex watcher reads only local `token_count` JSONL events.
- It does not record prompts or completions in the session log.
- It does not upload usage data to any server.
- It does not use third-party analytics.
- Provider API keys are used locally for proxying requests.
- API keys and Authorization headers must never be written to logs.
- Saving the API key is optional and uses localStorage in the desktop renderer; leave it unchecked if you prefer to paste the key each time.

## Development

```bash
npm install
npm run dev:desktop
```

Renderer-only debugging is still available:

```bash
npm run dev
```

The intended product surface is the Electron desktop app, not the browser page.

## Build From Source

```bash
npm install
npm test
npm run lint
npm run build
npm run start:desktop
```

## Test, Lint, Build

```bash
npm test
npm run lint
npm run build
npm run release:check
```

The renderer output is written to `dist/` and the Electron main/preload output is written to `dist-electron/`.

## Package For macOS

Token Shredder uses `electron-builder`.

```bash
npm run package:mac
npm run dist:mac
```

`package:mac` creates an unpacked `.app` for local QA. `dist:mac` creates `.dmg` and `.zip` artifacts in `release/`.

The v0.1.0 local build is unsigned and not notarized. Code signing and notarization are release operations for a later public distribution step.

## Release Checklist

```bash
npm install
npm run release:check
npm run package:mac
npm run dist:mac
```

Manual checks before publishing:

- Desktop pet is visible, draggable, transparent, frameless, and always on top.
- Right-click menu shows `进入后台` and `退出`.
- Backstage window opens and shows the actual collector port.
- Beginner setup can save and enable the local proxy.
- A non-streaming `/v1/chat/completions` test request can drive a real usage event when the upstream returns usage.
- `GET /health`, `POST /usage`, OpenAI-style usage, and `DELETE /usage` work.
- First launch waits for real usage; demo mode is opt-in.
- Demo mode stops after real usage in auto mode.
- Real usage idle state does not continue dropping TOKEN blocks.
- Port conflict from `17391` to `17392`-`17400` works.

## Permissions And Local Ports

- The app uses a transparent, frameless, always-on-top desktop window.
- The pet window uses a Chinese right-click menu for backstage and quit.
- The local collector listens on `127.0.0.1`, starting at port `17391`.
- The local proxy also listens on `127.0.0.1` under `/v1` on the same port.
- If `17391` is occupied, the app tries `17392` through `17400`.
- No inbound network listener is opened on public interfaces by default.

## Roadmap

- macOS menu bar / tray.
- Signed and notarized macOS builds.
- Better GIF and screenshot assets.
- JSON import / export.
- Streaming usage extraction for the local proxy.
- JS SDK wrapper.
- Python SDK wrapper.
- CLI wrapper.
- Generic agent log watchers beyond Codex.
- Multi-session / project mode.
- More pixel pet skins.

## Trademark And Logo Disclaimer

Token Shredder does not include real company logos, official provider icons, trademark logos, or real currency images. Labels such as "Codex-like Agent" or "Claude-like session" are user-editable descriptive examples and are not endorsements, affiliations, or official branding.

## License

MIT
