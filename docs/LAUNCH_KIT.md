# Token Shredder Launch Kit

Copy, adapt, and post these when the repo is ready for a launch push.

Repo:

https://github.com/qnianjinri-del/token-shredder

Release:

https://github.com/qnianjinri-del/token-shredder/releases/latest

## Short Pitch

Token Shredder is a tiny local desktop pet that shreds your AI token spending in real time.

## Best Assets

- README demo GIF: `docs/assets/token-shredder-demo.gif`
- Installed skins image: `docs/assets/token-shredder-skins.png`
- Social preview image: `docs/assets/token-shredder-social-preview.jpg`
- Online demo page: `docs/demo.html`
- First-run visual: `docs/assets/token-shredder-getting-started.png`
- Troubleshooting visual: `docs/assets/token-shredder-troubleshooting.png`
- Static storyboard: `docs/assets/token-shredder-demo-storyboard.png`
- Animated SVG fallback: `docs/assets/token-shredder-demo-animated.svg`
- Landing page: `docs/index.html`
- Release notes: `docs/releases/v0.1.20.md`

For the first launch push, lead with the GIF. For follow-up posts, use the first-run and troubleshooting cards to show that the project is more than a joke.

Regenerate launch assets:

```bash
npm run assets:launch
```

## Humble Pitch

I am not a professional developer, and this started as a small AI-assisted learning project. It is rough in places, but the core idea works: a local desktop pet receives token usage and turns AI spend into a cute little shredder animation. Feedback, issues, and PRs are very welcome.

## X / Twitter Post

I built Token Shredder, a tiny desktop pet that shreds dollar bills whenever my AI agent spends tokens.

Local-first. No prompt logging. OpenAI-compatible local proxy. Pixel-art TOKEN chunks.
New in the latest build: a leaner macOS package that keeps frontend build dependencies out of the shipped app bundle.

I’m not a professional developer, so a lot of it is still rough. Feedback and PRs welcome.

https://github.com/qnianjinri-del/token-shredder

## Chinese Post

我做了一个小工具叫 Token Shredder。

它是一个本地运行的桌面宠物：你的 AI Agent 消耗 token 时，它就在桌面上把美元碎成 TOKEN 字母块。

本地优先，不上传数据，不记录 prompt/completion。现在还是很早期，我也不是专业开发者，所以肯定有很多地方做得不够好，欢迎大家提 issue / PR 一起优化。

新版把 macOS 安装包又收紧了一轮：前端构建依赖不会再作为运行时 node_modules 塞进 App 包里，下载和分发更轻一些。

https://github.com/qnianjinri-del/token-shredder

## Hacker News

Title:

Show HN: Token Shredder – a desktop pet that shreds your AI token spend

Body:

I built a small local-first desktop app for visualizing AI token spend.

The idea is intentionally silly: when your agent or script reports token usage, a pixel-art desktop pet shreds a fictional dollar bill into TOKEN chunks. The useful part is that it has a local collector, a basic OpenAI-compatible proxy, editable pricing, and no cloud backend.

It does not log prompts, completions, or API keys. It currently targets macOS first and the first build is unsigned.

I’m not a professional developer, so some parts are definitely rough. I would love feedback on the local proxy, privacy boundary, onboarding, packaging, and future wrappers.

## Reddit / Community Post

Title:

I built a local desktop pet that visualizes AI token spend

Body:

I made a small open-source desktop app called Token Shredder.

It receives token usage from a local API or OpenAI-compatible proxy, calculates estimated cost from editable prices, and shows a pixel-art pet shredding a fictional dollar bill into TOKEN chunks.

What it does:

- Runs locally.
- Collector listens on `127.0.0.1`.
- Does not need an account.
- Does not log prompts or completions.
- Supports custom usage JSON and OpenAI-style usage.
- Includes a copyable Codex / ChatGPT prompt for wiring usage reporting into your own project.
- macOS first for now.

I’m not a professional developer, so I’m mostly looking for feedback and contributors. The idea is silly, but I think seeing token spend as a desktop pet makes AI costs more tangible.

GitHub: https://github.com/qnianjinri-del/token-shredder

## GitHub Repo Share Text

If you post inside GitHub Discussions or reply to related open-source threads:

I built a small local-first desktop app called Token Shredder. It shows a tiny pixel pet on your desktop, receives token usage locally, and visualizes estimated AI spend as shredded TOKEN blocks.

It is macOS-first and early. I am not a professional developer, so there are definitely rough edges. I would especially appreciate help with packaging, privacy review, more skins, and integration examples.

Repo: https://github.com/qnianjinri-del/token-shredder

## Where To Launch First

Prioritize places where the audience already understands AI agent token usage:

1. GitHub README + Release page.
2. GitHub Pages launch page.
3. GitHub Pages demo page.
4. X / Twitter with the GIF.
5. Hacker News `Show HN`.
6. Reddit communities focused on local-first tools, AI agents, and developer tools.
7. Discord / Slack groups where people already discuss AI coding agents.
8. Product Hunt later, after a recorded GIF and signed macOS build.

Avoid spammy cross-posting. A smaller number of honest posts with a GIF, clear privacy boundary, and a humble request for feedback is more likely to bring real stars.

## Product Hunt Draft

Name:

Token Shredder

Tagline:

A desktop pet that shreds your AI token spend in real time.

Description:

Token Shredder is a local-first desktop pet for AI developers. Point your agent, script, or OpenAI-compatible client at a local collector, configure editable token prices, and watch a pixel-art shredder turn AI token usage into shredded TOKEN blocks.

## 15-Second Demo Script

1. Show desktop with the pet idle.
2. Show a terminal sending `POST /usage`.
3. Cut back to the pet shredding a bill and dropping TOKEN blocks.
4. Show backstage cost breakdown for one second.
5. End on GitHub repo.

Caption:

Stop pretending tokens are free.

## 45-Second Demo Script

1. Open app.
2. Show first-run setup panel.
3. Fill sample provider/base URL/model fields or use local usage curl.
4. Send test usage.
5. Show pet shredding.
6. Explain local-first privacy.
7. Show skin picker.
8. End with contribution ask.

## Maintainer Reply Templates

Thanks for checking it out. This is still early, so rough edges are expected. I’d love to know what broke for you and what setup you tried.

Thanks for the idea. I’m keeping the first version local-first and small, but this sounds like a good candidate for the roadmap.

Thanks for the PR. I’ll review it with the privacy boundary in mind: no prompt/completion logging, no API key logging, no cloud analytics.
