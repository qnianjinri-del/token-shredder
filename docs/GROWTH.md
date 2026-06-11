# Token Shredder Growth Plan

Goal: give Token Shredder a credible shot at a large first-month launch.

Reality check: 10,000 GitHub stars in a month is a moonshot. It usually requires a clear product hook, a short demo loop, repeated distribution, and enough contributors/users to keep the repo active after launch day. This plan is designed to maximize the odds without pretending stars are guaranteed.

## Positioning

One-liner:

> A tiny desktop pet that shreds your AI token spending in real time.

Longer:

> Token Shredder is a local-first desktop pet for AI developers. Point your OpenAI-compatible client, agent, CLI, or script at a local collector, and the pixel shredder turns token usage into visible dollar destruction.

Core hook:

> I built a tiny desktop pet that shreds a dollar bill whenever my AI agent spends tokens.

Why people share it:

- It turns invisible AI spend into a funny visual.
- It is local-first and does not need a cloud account.
- It has a cute pixel-art desktop pet.
- It is actually useful beyond the joke.
- It invites skin/plugin contributions.

## Conversion Funnel

1. Someone sees a GIF or short video.
2. They understand the joke in 3 seconds.
3. They click GitHub.
4. README confirms it is local-first and not just a mockup.
5. They star it, download the macOS build, or open an issue.
6. Contributors add skins, wrappers, docs, or platform fixes.

## Assets Needed

P0:

- README cover image: done.
- One 10-15 second GIF: pet idle, usage arrives, bill shreds, TOKEN blocks fall.
- One 30-45 second demo video: setup, local proxy, usage event, pet moves.
- One screenshot of backstage with the skin picker visible.
- One screenshot of the desktop pet only.

P1:

- Product Hunt gallery images.
- Short vertical video for X/TikTok/Bilibili.
- A real HN-friendly technical writeup.

## 30-Day Launch Plan

### Days 1-3: Make the Repo Easy to Trust

- Add real GIF and screenshots.
- Keep README first screen short and visual.
- Add clear install instructions for unsigned macOS builds.
- Add issues labeled `good first issue`.
- Add a roadmap issue for skins and wrappers.
- Ask 5 technical friends to try the release and file issues.

### Days 4-7: Warm Launch

- Post a small build log on X/Twitter, Bluesky, Mastodon, and LinkedIn.
- Share in personal circles first; ask for feedback, not stars.
- Open 5-10 issues for known improvements.
- Reply quickly to every comment and issue.
- Cut `v0.1.1` if install/onboarding bugs appear.

### Week 2: Developer Launch

- Post to Hacker News as a Show HN.
- Post to Reddit communities where self-promotion is allowed.
- Post a technical article: local-first AI spend monitoring, privacy boundary, and how the proxy works.
- Submit to open-source newsletters and AI tooling lists.
- Ask early users to contribute skins.

### Week 3: Creator Loop

- Publish a “skin challenge”: add a pet skin in a PR.
- Make a short montage of skins.
- Tag contributors in release notes.
- Create a `good first skin` issue template.
- Make the project feel alive, not abandoned after launch day.

### Week 4: Second Spike

- Release `v0.1.1` or `v0.2.0` with one highly requested feature:
  - Windows/Linux test build, or
  - CLI wrapper, or
  - better Codex/agent monitoring, or
  - more skins.
- Post an update: “I launched a desktop pet that shreds AI spend. Here is what people asked for next.”

## Channel Plan

### GitHub

- Description: “A tiny local desktop pet that shreds your AI token spending in real time.”
- Topics: `ai`, `electron`, `typescript`, `desktop-pet`, `local-first`, `openai-compatible`, `token-usage`, `pixel-art`, `macos`, `developer-tools`.
- Pin the repo on the GitHub profile.
- Add a social preview image in repository settings.

### Hacker News

Best title candidates:

- `Show HN: Token Shredder – a desktop pet that shreds your AI token spend`
- `Show HN: I made a local desktop pet that visualizes AI token spend`

HN angle:

- Local-first.
- No prompt logging.
- Simple POST `/usage` API.
- Funny interface, but real cost accounting.
- Honest limitations: macOS first, unsigned build, early project.

### X / Twitter / Bluesky / Mastodon

Post with the GIF first. The first sentence must explain the whole thing.

Template:

> I built Token Shredder, a tiny desktop pet that shreds dollar bills whenever my AI agent spends tokens.
>
> Local-first. No prompt logging. OpenAI-compatible local proxy. Pixel-art TOKEN chunks.
>
> I’m not a professional developer, so it’s rough in places. Feedback and PRs welcome.
>
> GitHub: <repo>

### Reddit

Use only communities where project sharing is allowed. Do not spam. Lead with “I built this, looking for feedback.”

Potential angles:

- `/r/LocalLLaMA`: local-first AI tooling, OpenAI-compatible proxy.
- `/r/SideProject`: funny developer tool.
- `/r/opensource`: early open-source project, contributors welcome.
- `/r/macapps`: macOS desktop pet.

### Product Hunt

Only launch after there is a real GIF and the first-run flow is stable.

Positioning:

> A local desktop pet that makes AI token spend painfully visible.

## Metrics

Track daily:

- GitHub stars.
- Release downloads.
- Issues opened.
- PRs opened.
- README visits if GitHub insights are available.
- Which channels drove comments, not just likes.

Target pacing for 10,000 stars:

- Day 1: 500-1,000 stars.
- Week 1: 2,000-3,000 stars.
- Week 2: 5,000 stars.
- Week 4: 10,000 stars.

If Day 1 is below 100 stars, do not panic. Improve the GIF, README, and install path before broader posting.

## What Not To Do

- Do not buy stars.
- Do not spam communities.
- Do not overclaim provider pricing accuracy.
- Do not claim official support for providers.
- Do not imply prompts/completions are logged.
- Do not hide the unsigned macOS limitation.

