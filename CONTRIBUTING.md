# Contributing to Token Shredder

Thanks for considering a contribution.

Token Shredder is an early open-source desktop pet project. It is useful today, but many parts are still rough. Small improvements are welcome: bug reports, better onboarding copy, safer proxy behavior, new skins, docs, tests, screenshots, GIFs, packaging fixes, and platform support.

## Good First Contributions

- Record a real macOS demo GIF for the README.
- Improve the first-run setup flow.
- Add a new original pet skin.
- Improve the local proxy docs.
- Test on Windows or Linux and report what breaks.
- Add import/export for local config.
- Improve unsigned macOS install instructions.
- Add clearer errors for provider setup failures.

## Skin Contributions

New skins are welcome if they are safe to publish in an open-source repo.

Please include:

- A short skin name.
- Original image assets or assets you have permission to contribute.
- A small preview in the skin picker.
- No API keys, user data, prompts, completions, or private screenshots.

## Privacy Boundary

Token Shredder should remain local-first.

- Do not add cloud analytics.
- Do not log prompts or completions.
- Do not log API keys or Authorization headers.
- Keep the collector bound to `127.0.0.1` by default.
- Make any future network behavior explicit in the UI and README.

## Local Development

```bash
npm install
npm run dev:desktop
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

macOS packaging:

```bash
npm run package:mac
npm run dist:mac
```

## Pull Requests

Please keep pull requests focused. A small PR with one clear improvement is easier to review than a huge mixed change.

Useful PR description format:

```md
## What changed

## Why

## Screenshots / GIFs

## Checks
- [ ] npm test
- [ ] npm run lint
- [ ] npm run build
```

