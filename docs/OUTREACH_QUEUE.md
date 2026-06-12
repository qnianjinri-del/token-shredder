# Token Shredder Outreach Queue

Goal: get real developers to see the project, not fake stars.

Primary link:

https://qnianjinri-del.github.io/token-shredder/

GitHub link:

https://github.com/qnianjinri-del/token-shredder

Release:

https://github.com/qnianjinri-del/token-shredder/releases/tag/v0.1.1

## Priority Order

1. X / Twitter with the GIF.
2. Hacker News `Show HN`.
3. Reddit communities where project sharing is allowed.
4. AI agent / coding-tool Discord or Slack groups.
5. Product Hunt later, after a few outside users confirm install works.

## X / Twitter

Post with `docs/assets/token-shredder-demo.gif`.

```text
I built Token Shredder, a tiny local desktop pet that shreds dollar bills whenever my AI agent spends tokens.

It is early and rough. I am not a professional developer, so feedback and PRs are very welcome.

Local-first. No prompt logging. OpenAI-style usage support. 5 pixel pet skins.

https://qnianjinri-del.github.io/token-shredder/
```

Follow-up reply:

```text
Repo: https://github.com/qnianjinri-del/token-shredder

The first macOS build is unsigned. The app listens on 127.0.0.1 and is designed not to log prompts, completions, or API keys.
```

## Hacker News

Title:

```text
Show HN: Token Shredder – a desktop pet that shreds your AI token spend
```

URL:

```text
https://github.com/qnianjinri-del/token-shredder
```

First comment:

```text
I built this because AI agent spend can feel abstract until you see it happening.

Token Shredder is a small local-first Electron app. It receives token usage through a local collector or OpenAI-compatible proxy, estimates cost from user-configured pricing, and animates a tiny pixel desktop pet shredding fictional bills into TOKEN blocks.

It does not need a cloud account, and it is designed not to log prompts, completions, or API keys. The current macOS build is unsigned and the project is early. I am not a professional developer, so I would especially appreciate feedback on privacy boundaries, packaging, onboarding, and integration examples.
```

## Reddit

Suggested communities:

- r/SideProject
- r/opensource
- r/macapps
- r/LocalLLaMA, only if self-promotion rules allow it

Title:

```text
I built a local desktop pet that visualizes AI token spend
```

Body:

```text
I made a small open-source app called Token Shredder.

It runs locally and shows a tiny desktop pet. When your agent/script/client reports token usage, it estimates cost from editable pricing and shreds a fictional bill into TOKEN blocks.

What it does:
- Local collector on 127.0.0.1
- Basic OpenAI-compatible usage support
- 5 pixel pet skins
- No cloud account
- No prompt/completion logging
- macOS first for now

I am not a professional developer, so this is rough in places. I am mostly looking for feedback, privacy review, packaging help, and people who want to add silly little skins.

Launch page: https://qnianjinri-del.github.io/token-shredder/
GitHub: https://github.com/qnianjinri-del/token-shredder
```

## Chinese Post

```text
我做了一个小工具 Token Shredder。

它是一个本地运行的 AI token 花费桌面宠物：你的 Agent / 脚本 / OpenAI-compatible client 上报 token usage 后，它会按你配置的价格估算成本，然后在桌面上把一张虚构美元碎成 TOKEN 字母块。

现在有 5 套像素风皮肤。项目还很早期，我也不是专业开发者，所以代码和体验肯定有不少粗糙的地方，欢迎提 issue / PR 一起优化。

本地优先，不上传数据，不记录 prompt / completion / API key。

落地页：https://qnianjinri-del.github.io/token-shredder/
GitHub：https://github.com/qnianjinri-del/token-shredder
```
