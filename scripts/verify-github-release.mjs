import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = process.env.GITHUB_REPOSITORY || 'qnianjinri-del/token-shredder';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = packageJson.version;
const tag = `v${version}`;
const releaseUrl = `https://github.com/${repo}/releases/tag/${tag}`;
const localAssets = [
  resolve(root, `release/Token Shredder-${version}-mac-arm64.dmg`),
  resolve(root, `release/Token Shredder-${version}-mac-arm64.zip`),
  resolve(root, `release/Token Shredder-${version}-mac-arm64.dmg.blockmap`),
  resolve(root, `release/Token Shredder-${version}-mac-arm64.zip.blockmap`),
  resolve(root, 'release/latest-mac.yml'),
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const head = async (url, attempts = 5) => {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const output = execFileSync(
        'curl',
        ['--head', '--location', '--silent', '--show-error', '--max-time', '20', url],
        { encoding: 'utf8' },
      );
      const headerBlocks = output.trim().split(/\r?\n\r?\n/);
      const finalHeaders = headerBlocks[headerBlocks.length - 1] ?? '';
      const statusMatch = finalHeaders.match(/^HTTP\/\S+\s+(\d+)/m);
      const status = statusMatch ? Number(statusMatch[1]) : 0;

      if (status >= 200 && status < 400) {
        const lengthMatch = finalHeaders.match(/^content-length:\s*(\d+)/im);

        return {
          status,
          headers: {
            get: (name) =>
              name.toLowerCase() === 'content-length' && lengthMatch ? lengthMatch[1] : null,
          },
        };
      }

      lastError = new Error(`${url} returned ${status || 'unknown status'}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(2_000 * attempt);
  }

  throw lastError;
};

const releaseAssetName = (filePath) => basename(filePath).replaceAll(' ', '.');

const main = async () => {
  const releaseResponse = await head(releaseUrl);
  console.log(`verified release page ${releaseResponse.status} ${releaseUrl}`);

  for (const asset of localAssets) {
    const expectedSize = statSync(asset).size;
    const assetName = releaseAssetName(asset);
    const url = `https://github.com/${repo}/releases/download/${tag}/${assetName}`;
    const response = await head(url);
    const remoteSize = Number(response.headers.get('content-length') || 0);

    if (remoteSize > 0 && Math.abs(remoteSize - expectedSize) > 2048) {
      throw new Error(`${assetName} size mismatch: local ${expectedSize}, remote ${remoteSize}`);
    }

    console.log(`verified asset ${assetName} ${remoteSize || 'unknown-size'}`);
  }
};

await main();
