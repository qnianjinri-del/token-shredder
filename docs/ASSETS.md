# Launch Assets

This folder contains the visual assets used by the README, launch page, release notes, and social posts.

## Regenerate

```bash
npm run assets:launch
```

The generator uses the real local pixel pet assets from `public/assets`. On macOS, it uses Chrome / Chromium headless to export PNG/JPG files from SVG sources. If Chrome is not available, the SVG files are still generated.

## Key Files

- `docs/assets/token-shredder-demo.gif`  
  Main README demo animation.

- `docs/assets/token-shredder-social-preview.jpg`  
  Open Graph / Twitter preview image for the GitHub Pages launch page.

- `docs/assets/token-shredder-social-preview.png`  
  PNG version of the social preview.

- `docs/assets/token-shredder-getting-started.png`  
  Three-path first-run visual: no-key demo, copy to Codex, and direct `POST /usage`.

- `docs/assets/token-shredder-troubleshooting.png`  
  Provider setup failure / troubleshooting visual.

- `docs/assets/token-shredder-skins.png`  
  Skin showcase generated from installed local pet assets.

- `docs/assets/token-shredder-demo-storyboard.png`  
  Static four-frame storyboard for communities that do not autoplay GIFs.

- `docs/assets/token-shredder-demo-animated.svg`  
  Lightweight animated SVG demo using real pet frames. Keep `token-shredder-demo.gif` as the primary README image for compatibility.

## Rules

- Do not use real company logos.
- Do not use real currency images.
- Do not fake provider billing accuracy.
- Keep privacy copy visible when the asset is used for launch posts.
- If a screenshot is edited or generated, do not present it as an untouched product screenshot.
