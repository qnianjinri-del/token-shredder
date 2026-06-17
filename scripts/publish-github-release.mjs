import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  releaseAssetName,
  releaseNotesPath,
  releaseUploadPaths,
  repo,
  tag,
} from './release-assets.mjs';

const releaseBody = readFileSync(releaseNotesPath, 'utf8');

const readGitCredentials = () => {
  try {
    const credentialOutput = execFileSync('git', ['credential', 'fill'], {
      input: 'protocol=https\nhost=github.com\n\n',
    });

    return Object.fromEntries(
      credentialOutput
        .toString('utf8')
        .split('\n')
        .filter((line) => line.includes('='))
        .map((line) => line.split(/=(.*)/s).slice(0, 2)),
    );
  } catch {
    return {};
  }
};

const credentials = readGitCredentials();
const token = credentials.password || credentials.oauth_token || process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error('No GitHub token available from git credential helper or GITHUB_TOKEN.');
}

const apiHeaders = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'token-shredder-release-script',
};

const githubJson = async (method, url, payload) => {
  const response = await fetch(url, {
    method,
    headers: {
      ...apiHeaders,
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (response.status === 404) {
    return [404, null];
  }

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`GitHub API ${method} ${url} failed: ${response.status} ${text}`);
  }

  return [response.status, body];
};

const uploadAsset = (uploadUrl, filePath) => {
  const name = releaseAssetName(filePath);
  const url = `${uploadUrl}?${new URLSearchParams({ name })}`;
  const output = execFileSync(
    'curl',
    [
      '--silent',
      '--show-error',
      '--fail-with-body',
      '--location',
      '--request',
      'POST',
      '--header',
      `Accept: ${apiHeaders.Accept}`,
      '--header',
      `X-GitHub-Api-Version: ${apiHeaders['X-GitHub-Api-Version']}`,
      '--header',
      `User-Agent: ${apiHeaders['User-Agent']}`,
      '--header',
      `Authorization: ${apiHeaders.Authorization}`,
      '--header',
      'Content-Type: application/octet-stream',
      '--data-binary',
      `@${filePath}`,
      url,
    ],
    {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return JSON.parse(output);
};

const main = async () => {
  const api = 'https://api.github.com';
  const [status, existingRelease] = await githubJson(
    'GET',
    `${api}/repos/${repo}/releases/tags/${tag}`,
  );
  const release =
    status === 404
      ? (
          await githubJson('POST', `${api}/repos/${repo}/releases`, {
            tag_name: tag,
            target_commitish: 'main',
            name: `Token Shredder ${tag}`,
            body: releaseBody,
            draft: false,
            prerelease: false,
          })
        )[1]
      : existingRelease;

  console.log(status === 404 ? `created release ${release.html_url}` : `release exists ${release.html_url}`);

  const uploadUrl = release.upload_url.split('{', 1)[0];
  const existingAssets = new Set((release.assets ?? []).map((asset) => asset.name));

  for (const asset of releaseUploadPaths) {
    const name = releaseAssetName(asset);
    if (existingAssets.has(name)) {
      console.log(`skip existing asset ${name}`);
      continue;
    }

    const uploaded = await uploadAsset(uploadUrl, asset);
    console.log(`uploaded ${uploaded.name} ${uploaded.browser_download_url}`);
  }
};

await main();
