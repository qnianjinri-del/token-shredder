# Getting Started With Token Shredder

This guide answers one question: once you have Token Shredder, how do you actually use it?

Token Shredder is a local AI token-spend desktop pet. It does not magically know every AI request on your machine. You connect an agent, script, SDK, or local OpenAI-compatible client, and Token Shredder turns usage numbers into a tiny desktop pet shredding money.

## The Three Things To Know First

1. The desktop surface is only the pet. Configuration lives in the backstage window.
2. Token Shredder only needs usage numbers by default. It does not need prompts, completions, messages, or API keys in the usage log.
3. Pricing is user-configured. It is not official live provider pricing.

## First Launch

1. Open `Token Shredder.app`.
2. Right-click the desktop pet.
3. Choose `进入后台`.
4. Start from the `开始` tab.
5. Read `下一步建议`, then click `运行自动体检`.

If you only want to see the pet move, click `一键试玩`. That writes one local simulated usage event. It does not call a model and does not represent real billing.

## Choose One Integration Path

### Path A: Your Code Already Knows Token Usage

This is the simplest and most reliable path.

Post usage numbers to:

```txt
http://127.0.0.1:17391/usage
```

If port `17391` is occupied, the backstage window shows the actual port.

Example:

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"my-agent","scenarioName":"repo cleanup","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'
```

Use this when:

- You have a Node.js / Python script.
- Your agent already exposes usage numbers.
- You do not want to give Token Shredder an API key.

### Path B: You Use An OpenAI-Compatible SDK

If your client supports `baseURL`, use the local proxy.

Prepare:

1. Upstream provider API key.
2. Upstream Base URL.
3. Model / deployment / endpoint ID.
4. Input / output / cached input / reasoning token prices.

Then point your client to the local base URL shown backstage:

```txt
http://127.0.0.1:17391/v1
```

If the upstream response includes usage, Token Shredder extracts it and drives the desktop pet.

### Path C: You Want A Coding Agent To Wire It Up

Open the `接入` tab and click:

```txt
复制给 Codex/ChatGPT
```

Paste that prompt into your coding agent. It asks the agent to:

- Extract response usage.
- POST usage to Token Shredder.
- Avoid double-counting cached tokens.
- Avoid logging prompts, completions, messages, request bodies, API keys, or Authorization headers.

## How To Know It Worked

You should see:

- The usage event count increase.
- A new event in the session log.
- The desktop pet briefly run.
- When spending stops, the pet stops at the current dollar progress instead of faking more spending.

You can also check:

```bash
curl http://127.0.0.1:17391/health
```

`ok: true` means the local collector is running.

## Troubleshooting

### Backstage Is Blank

Quit and reopen the app. If it still happens, copy diagnostics and open an issue.

### POST /usage Does Nothing

Check:

- You are using the actual port shown backstage.
- Your JSON is valid.
- Numeric fields are numbers.
- The app is still running.

### Proxy Test Fails

Check:

- API key.
- Upstream Base URL.
- Model / endpoint ID.
- Whether your provider is actually OpenAI-compatible.
- Whether the upstream response includes usage.

### Cost Looks Wrong

Check:

- Prices are entered per 1M tokens.
- Cached input tokens use the cached input price.
- Reasoning tokens use the reasoning price if your provider charges separately.
- Token Shredder is a local estimate, not the provider's official bill.

## Privacy Boundary

By default, Token Shredder:

- Listens on `127.0.0.1`.
- Records usage numbers, source, scenario, timestamp, and local estimated cost.
- Does not record prompts.
- Does not record completions.
- Does not record messages.
- Does not upload data.
- Does not use third-party analytics.
- Does not write API keys to the usage log.

## Fastest Smoke Test

```bash
curl http://127.0.0.1:17391/health

curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"hello","inputTokens":100000,"outputTokens":50000}'
```

Then watch the pet shred once.
