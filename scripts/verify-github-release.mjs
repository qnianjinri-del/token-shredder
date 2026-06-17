import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import {
  releaseAssetName,
  releaseManifestPath,
  releaseUploadPaths,
  repo,
  tag,
} from './release-assets.mjs';

const releaseUrl = `https://github.com/${repo}/releases/tag/${tag}`;

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

const main = async () => {
  const releaseResponse = await head(releaseUrl);
  console.log(`verified release page ${releaseResponse.status} ${releaseUrl}`);

  const manifest = JSON.parse(readFileSync(releaseManifestPath, 'utf8'));
  const manifestAssets = new Set(manifest.assets.map((asset) => asset.name));

  for (const asset of releaseUploadPaths) {
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

  for (const asset of releaseUploadPaths.slice(0, -1)) {
    const assetName = releaseAssetName(asset);
    if (!manifestAssets.has(assetName)) {
      throw new Error(`manifest missing ${assetName}`);
    }
  }
  console.log(`verified manifest ${releaseAssetName(releaseManifestPath)}`);
};

await main();
