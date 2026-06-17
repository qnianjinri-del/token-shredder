import { createHash } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import {
  releaseAssetName,
  releaseAssetPaths,
  releaseManifestPath,
  repo,
  root,
  tag,
  version,
} from './release-assets.mjs';

const sha256File = (filePath) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(filePath));
  return hash.digest('hex');
};

const manifest = {
  app: 'Token Shredder',
  version,
  tag,
  repository: repo,
  generatedAt: new Date().toISOString(),
  assets: releaseAssetPaths.map((filePath) => {
    const name = releaseAssetName(filePath);

    return {
      name,
      localPath: relative(root, filePath),
      size: statSync(filePath).size,
      sha256: sha256File(filePath),
      downloadUrl: `https://github.com/${repo}/releases/download/${tag}/${name}`,
    };
  }),
};

writeFileSync(releaseManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`wrote ${releaseManifestPath}`);
for (const asset of manifest.assets) {
  console.log(`${asset.sha256}  ${asset.name}`);
}
