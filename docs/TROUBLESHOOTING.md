# Token Shredder Troubleshooting

This guide helps answer one question: why did the desktop pet not move for real usage?

Important rule: Token Shredder only needs usage numbers by default. Do not paste API keys, prompts, completions, messages, request bodies, or Authorization headers into issues.

## Start With Self-Check

1. Open the app.
2. Right-click the pet and choose `进入后台`.
3. Open the `开始` tab.
4. Click `运行自动体检`.
5. Follow the next action shown by the self-check card.

Self-check reports intentionally exclude API keys, prompts, completions, and messages.

## Local Collector Is Unavailable

Symptoms:

- `GET /health` fails.
- The backstage says the local service is not running.
- `POST /usage` does nothing.

Try:

1. Quit and reopen Token Shredder.
2. Check whether ports `17391-17400` are occupied.
3. Use the actual port shown backstage instead of hard-coding `17391`.
4. If it still fails, copy the self-check report into an issue.

## POST /usage Does Not Move The Pet

Check:

1. You are posting to the actual port shown backstage.
2. Your JSON is valid.
3. Token fields are numbers.
4. Not every token field and directCost is zero.
5. The app is still running.

Minimal test:

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"troubleshooting","inputTokens":100000,"outputTokens":50000}'
```

## Local Proxy Test Fails

Open the `接入` tab and click `发送测试请求`. When it fails, Token Shredder now shows an actionable troubleshooting card with a copyable report.

### API Key Or Permission Problem

Signals:

- HTTP `401`
- HTTP `403`
- `Unauthorized`
- `Forbidden`
- `API key`

Try:

1. Make sure the API key has no extra whitespace.
2. Make sure the key belongs to the current provider, region, and project.
3. Make sure the account can call the selected model.
4. Never paste real API keys into issues.

### Model, Endpoint, Or Path Problem

Signals:

- HTTP `404`
- `model not found`
- `endpoint not found`
- `deployment`

Try:

1. Confirm the upstream Base URL.
2. Confirm whether the Base URL needs `/v1` or a provider-specific compatible path.
3. Confirm the model / endpoint ID exactly matches your provider console.
4. If your provider uses deployment IDs, follow its OpenAI-compatible docs.

### Rate Limit Or Quota Problem

Signals:

- HTTP `429`
- `rate limit`
- `quota`
- `too many requests`

Try:

1. Wait and retry.
2. Check balance, quota, and rate limits.
3. Reduce test frequency.
4. Test with a cheaper or smaller model.

### Request Shape Problem

Signals:

- HTTP `400`
- `bad request`
- `invalid request`

Try:

1. Confirm the provider supports `/chat/completions`.
2. Confirm it supports `messages`.
3. Confirm it supports non-streaming requests.
4. If the provider requires special fields, use direct `POST /usage` first.

### Request Succeeds But No Usage Is Returned

Symptoms:

- The test request succeeds.
- The upstream returns content.
- The pet does not move for real cost.
- The backstage says no usage was received.

Try:

1. Check whether the provider returns usage in non-streaming responses.
2. If you are using streaming, test with non-streaming first.
3. If the upstream never returns usage, make your code manually `POST /usage`.

## Copy Troubleshooting Report

The provider troubleshooting card can copy a report. It includes:

- Provider type.
- Local proxy URL.
- Upstream Base URL.
- Model / endpoint.
- HTTP status.
- Whether usage was received.
- Error summary.

It excludes:

- API keys.
- Authorization headers.
- Prompts.
- Completions.
- Messages.
- Request bodies.

## Cost Looks Wrong

Check:

1. Prices are entered per 1M tokens.
2. Cached input tokens use the cached input price.
3. Reasoning tokens use the reasoning price if your provider charges separately.
4. OpenAI-style cached tokens are subtracted from ordinary input tokens.
5. Token Shredder is a local estimate, not an official provider bill.
