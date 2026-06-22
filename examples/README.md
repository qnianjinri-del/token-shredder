# Token Shredder Examples

These tiny examples send token usage to a running Token Shredder desktop app.

Start Token Shredder first, then run:

```bash
node examples/post-usage-node.mjs
python3 examples/post-usage-python.py
node examples/post-openai-style-usage.mjs
node examples/token-shredder-reporter.mjs
python3 examples/token_shredder_reporter.py
```

By default they post to:

```txt
http://127.0.0.1:17391/usage
```

If Token Shredder switched to another port, copy the actual backstage endpoint and set:

```bash
export TOKEN_SHREDDER_URL="http://127.0.0.1:17392/usage"
```

The examples only send usage numbers. They do not send prompts, completions, messages, or API keys.

## Reporter helpers

`token-shredder-reporter.mjs` and `token_shredder_reporter.py` are small copy-paste helpers for your own project. They:

- accept an OpenAI-style response object,
- extract `usage`,
- subtract cached tokens from prompt tokens to avoid double counting,
- POST only token counts to Token Shredder.

JavaScript:

```js
import { reportOpenAIUsage } from "./token-shredder-reporter.mjs";

const response = await client.chat.completions.create(/* ... */);
await reportOpenAIUsage(response, {
  source: "my-node-agent",
  scenarioName: "repo cleanup",
});
```

Python:

```python
from token_shredder_reporter import report_openai_usage

response = client.chat.completions.create(...)
report_openai_usage(
    response.model_dump(),
    source="my-python-agent",
    scenario_name="repo cleanup",
)
```
