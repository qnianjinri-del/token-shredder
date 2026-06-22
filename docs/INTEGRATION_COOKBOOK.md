# Token Shredder Integration Cookbook

This guide is for wiring real token usage into Token Shredder without sending prompts, completions, messages, or API keys to the usage log.

## Choose a Path

Use the simplest path your project can support:

1. `POST /usage` if your script already knows token counts.
2. Reporter helper if your model response has an OpenAI-style `usage` object.
3. Local OpenAI-compatible proxy if you want Token Shredder to sit between your client and upstream provider.

## Path 1: Direct POST /usage

```bash
curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{
    "source": "my-agent",
    "scenarioName": "repo cleanup",
    "inputTokens": 120000,
    "outputTokens": 45000,
    "cachedInputTokens": 30000,
    "reasoningTokens": 8000,
    "directCost": 0
  }'
```

If Token Shredder switched ports, copy the actual endpoint from backstage.

## Path 2: JavaScript Reporter Helper

Copy `examples/token-shredder-reporter.mjs` into your project.

```js
import { reportOpenAIUsage } from "./token-shredder-reporter.mjs";

const response = await client.chat.completions.create({
  model: "your-model",
  messages,
});

await reportOpenAIUsage(response, {
  source: "my-node-agent",
  scenarioName: "repo cleanup",
});
```

The helper accepts OpenAI-style responses such as:

```json
{
  "usage": {
    "prompt_tokens": 180000,
    "completion_tokens": 64000,
    "prompt_tokens_details": {
      "cached_tokens": 40000
    },
    "completion_tokens_details": {
      "reasoning_tokens": 9000
    }
  }
}
```

It reports:

- `inputTokens = prompt_tokens - cached_tokens`
- `cachedInputTokens = cached_tokens`
- `outputTokens = completion_tokens`
- `reasoningTokens = reasoning_tokens`

## Path 3: Python Reporter Helper

Copy `examples/token_shredder_reporter.py` into your project.

```python
from token_shredder_reporter import report_openai_usage

response = client.chat.completions.create(
    model="your-model",
    messages=messages,
)

report_openai_usage(
    response.model_dump(),
    source="my-python-agent",
    scenario_name="repo cleanup",
)
```

If your SDK returns plain dictionaries, pass the dictionary directly.

## Path 4: Local OpenAI-Compatible Proxy

In the backstage app:

1. Fill provider API Key.
2. Fill upstream Base URL.
3. Fill model / endpoint ID.
4. Fill editable sample pricing.
5. Enable the local proxy.

Then point your client to:

```txt
http://127.0.0.1:17391/v1
```

Example:

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "token-shredder-local",
  baseURL: "http://127.0.0.1:17391/v1",
});
```

## Privacy Rules

Send only:

- token counts,
- source name,
- scenario name,
- optional direct cost.

Do not send:

- prompts,
- completions,
- chat messages,
- request bodies,
- API keys,
- Authorization headers.

## Common Mistakes

- Counting cached tokens twice. If `prompt_tokens` includes `cached_tokens`, subtract cached tokens from normal input tokens.
- Posting to `17391` when Token Shredder switched to another port. Copy the actual backstage endpoint.
- Expecting streaming responses to always include usage. Some providers do not return usage in streams.
- Treating sample pricing as official live pricing. Prices are editable estimates.

