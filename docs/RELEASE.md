# Release Guide

## v0.1.x Release Checklist

- Confirm `package.json` version matches the release tag.
- Confirm the app name is `Token Shredder`.
- Confirm macOS bundle id is `com.tokenshredder.app`.
- Confirm pricing copy says editable sample values.
- Confirm README only claims the basic local proxy, not SDK, CLI wrapper, log watcher, or full streaming usage extraction.
- Confirm Codex watcher copy says token_count only and does not claim official billing accuracy.
- Confirm no prompt, completion, message body, API key, Authorization header, analytics, real provider logo, or real currency image is included.

## Local Verification Commands

```bash
npm install
npm test
npm run lint
npm run build
npm run dev:desktop
npm run release:check
npm run package:mac
npm run dist:mac
```

## Manual QA Checklist

- Desktop pet is visible.
- Desktop pet is transparent, frameless, small, and always on top.
- Desktop pet can be dragged.
- First incomplete onboarding opens backstage automatically.
- First launch waits for real usage and does not shred fake money by default.
- Right-click menu works.
- Right-click menu shows `进入后台` and `退出`.
- Backstage window opens.
- Backstage UI is Chinese and usable.
- Backstage shows the actual collector port.
- Beginner setup includes the no-key quick demo.
- Backstage `30 秒验证` can drive a quick demo and a collector smoke test.
- Share panel can copy English and Chinese launch posts after a session.
- Beginner setup accepts API Key, Base URL, model / endpoint ID, and pricing for the local proxy path.
- Saving and enabling the local proxy returns a local `/v1` Base URL.
- Codex local monitor shows watching / missing / error state.
- `GET /health` returns JSON with `ok: true`.
- `node examples/post-usage-node.mjs` can drive a local usage event.
- `python3 examples/post-usage-python.py` can drive a local usage event.
- Custom `POST /usage` is accepted.
- OpenAI-style `POST /usage` is accepted.
- Basic non-streaming `/v1/chat/completions` proxy request works with a valid configured provider.
- New Codex `token_count` lines can drive a usage event without replaying old session history.
- Cached tokens are subtracted from ordinary input tokens for OpenAI-style usage.
- `DELETE /usage` clears the current session.
- Demo mode works when explicitly enabled before real usage.
- Real monitoring mode starts after real usage.
- Usage idle state stops fake shredding and stops dropping TOKEN blocks.
- Port conflict handling switches from `17391` to `17392`-`17400`.
- macOS package opens on the local machine after the expected unsigned-app warning.

## Local API Smoke Test

```bash
curl http://127.0.0.1:17391/health

curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"release-smoke","scenarioName":"release smoke","inputTokens":120000,"outputTokens":45000,"cachedInputTokens":30000,"reasoningTokens":8000}'

curl -X POST http://127.0.0.1:17391/usage \
  -H "Content-Type: application/json" \
  -d '{"source":"openai-style-smoke","usage":{"prompt_tokens":120000,"completion_tokens":45000,"prompt_tokens_details":{"cached_tokens":30000},"completion_tokens_details":{"reasoning_tokens":8000}}}'

curl -X DELETE http://127.0.0.1:17391/usage
```

## GitHub Release Template

Title:

```txt
Token Shredder v0.1.7
```

Body:

```md
A local desktop pet that shreds your AI token spending in real time.

I am not a professional developer, and this is a small AI-assisted learning project. A lot of details are probably not perfect yet, so issues, suggestions, and pull requests are very welcome.

### Highlights

- Pixel-art desktop shredder pet for macOS.
- First-screen `从这里开始` guide for new users.
- New-user checklist, config backup / restore, and copyable diagnostics.
- Session export as JSON / CSV / Markdown.
- Dedicated integration recipes and scripted GitHub Release publishing.
- One-click local quick demo for first-time users.
- Backstage 30-second verification panel and curl / JS / Python / Agent copy-paste examples.
- English and Chinese launch-post copy buttons in the share panel.
- Local usage collector, basic `/v1` proxy, and Codex token_count watcher on 127.0.0.1 / local files.
- Custom and OpenAI-style usage payloads.
- Editable sample pricing.
- 6 switchable desktop pet skins.
- Demo mode and real monitoring mode.
- Local-first privacy model: no cloud backend, no prompt logging, no analytics.
- Codex local watcher reads only token_count events.

### Downloads

- macOS .dmg: unsigned v0.1.x build.
- macOS .zip: unsigned fallback artifact.

macOS may warn that the app is from an unidentified developer because this build is unsigned and not notarized.

### Known Limits

- macOS is the primary target.
- Windows and Linux are planned / experimental.
- Full streaming usage extraction is not implemented.
- SDK / CLI wrappers and generic agent log watchers are not implemented yet.
- Prices are user-configured estimates, not official live provider prices.
```

## Launch Tweet Draft

```txt
I built Token Shredder: a tiny local desktop pet that shreds dollar bills whenever your AI agent spends tokens.

Local-first. No cloud. No prompt logging. Point your OpenAI-compatible client at localhost, or let it watch Codex token_count events, and watch your budget disappear in real time.
```

## Hacker News Title Drafts

- Show HN: Token Shredder, a desktop pet that visualizes AI token spend
- Show HN: I made a local desktop pet that shreds dollars as agents spend tokens
- Token Shredder: local-first AI token spend visualizer with a tiny desktop pet

## Known Limitations

- macOS is the v0.1.x primary target.
- The v0.1.x local build is unsigned and not notarized.
- Basic OpenAI-compatible proxy is available for non-streaming usage extraction; full streaming usage extraction is not implemented.
- Codex monitor is based on local token_count events, not official billing.
- JS SDK wrapper is not implemented.
- Python SDK wrapper is not implemented.
- CLI wrapper is not implemented.
- Automatic agent log watcher is not implemented.
- Prices are user-configured editable sample values, not official live provider prices.
