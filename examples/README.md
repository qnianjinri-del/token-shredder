# Token Shredder Examples

These tiny examples send token usage to a running Token Shredder desktop app.

Start Token Shredder first, then run:

```bash
node examples/post-usage-node.mjs
python3 examples/post-usage-python.py
node examples/post-openai-style-usage.mjs
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
