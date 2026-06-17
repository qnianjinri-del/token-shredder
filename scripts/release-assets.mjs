import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

export const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

export const version = packageJson.version;

export const tag = `v${version}`;

export const repo = process.env.GITHUB_REPOSITORY || 'qnianjinri-del/token-shredder';

export const releaseNotesPath = resolve(root, `docs/releases/${tag}.md`);

export const releaseManifestPath = resolve(root, `release/Token-Shredder-${version}-manifest.json`);

export const releaseAssetPaths = [
  resolve(root, `release/Token-Shredder-${version}-mac-arm64.dmg`),
  resolve(root, `release/Token-Shredder-${version}-mac-arm64.zip`),
  resolve(root, `release/Token-Shredder-${version}-mac-arm64.dmg.blockmap`),
  resolve(root, `release/Token-Shredder-${version}-mac-arm64.zip.blockmap`),
  resolve(root, 'release/latest-mac.yml'),
];

export const releaseUploadPaths = [...releaseAssetPaths, releaseManifestPath];

export const releaseAssetName = (filePath) => basename(filePath).replaceAll(' ', '.');
