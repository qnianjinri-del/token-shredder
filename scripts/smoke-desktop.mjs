import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const electronCli = path.join(rootDir, 'node_modules', 'electron', 'cli.js');
const packagedAppBinary = path.join(
  rootDir,
  'release',
  'mac-arm64',
  'Token Shredder.app',
  'Contents',
  'MacOS',
  'Token Shredder',
);
const isPackagedSmoke = process.argv.includes('--packaged');
const command = isPackagedSmoke ? packagedAppBinary : process.execPath;
const commandArgs = isPackagedSmoke ? [] : [electronCli, '.'];
const startPort = Number(process.env.TOKEN_SHREDDER_SMOKE_PORT || 19691);
const endPort = startPort + 8;
const userDataDir = mkdtempSync(path.join(tmpdir(), 'token-shredder-smoke-'));
const timeoutMs = 25_000;
const startedAt = Date.now();
const logs = [];

const child = spawn(command, commandArgs, {
  cwd: rootDir,
  env: {
    ...process.env,
    TOKEN_SHREDDER_SMOKE_TEST: '1',
    TOKEN_SHREDDER_DISABLE_CODEX_MONITOR: '1',
    TOKEN_SHREDDER_USER_DATA_DIR: userDataDir,
    TOKEN_SHREDDER_USAGE_PORT: String(startPort),
    TOKEN_SHREDDER_MAX_USAGE_PORT: String(endPort),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => logs.push(chunk.toString('utf8')));
child.stderr.on('data', (chunk) => logs.push(chunk.toString('utf8')));

let childExit = null;
child.once('exit', (code, signal) => {
  childExit = { code, signal };
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${url} returned non-JSON: ${text.slice(0, 200)}`);
  }

  return { response, json };
};

const waitForHealth = async () => {
  while (Date.now() - startedAt < timeoutMs) {
    if (childExit) {
      throw new Error(`Electron exited early: ${JSON.stringify(childExit)}\n${logs.join('')}`);
    }

    for (let port = startPort; port <= endPort; port += 1) {
      try {
        const { response, json } = await fetchJson(`http://127.0.0.1:${port}/health`);
        if (response.ok && json?.ok === true && json?.app === 'Token Shredder') {
          return { port, health: json };
        }
      } catch {
        // Server may still be starting or this port may be unused.
      }
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for Token Shredder health endpoint.\n${logs.join('')}`);
};

const postUsage = async (usageUrl, body) => {
  const { response, json } = await fetchJson(usageUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok || json?.ok !== true || json?.accepted !== true) {
    throw new Error(`POST /usage failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return json;
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const stopChild = async () => {
  if (!childExit) {
    child.kill('SIGTERM');
    const stopStartedAt = Date.now();
    while (!childExit && Date.now() - stopStartedAt < 5_000) {
      await sleep(100);
    }
    if (!childExit) {
      child.kill('SIGKILL');
    }
  }

  rmSync(userDataDir, { recursive: true, force: true });
};

try {
  const { port, health } = await waitForHealth();
  const baseUrl = `http://127.0.0.1:${port}`;
  const usageUrl = `${baseUrl}/usage`;

  assert(health.port === port, `health.port mismatch: expected ${port}, got ${health.port}`);
  assert(health.proxyBaseUrl === `${baseUrl}/v1`, 'proxyBaseUrl should use the actual smoke port');

  const nativeResult = await postUsage(usageUrl, {
    source: 'desktop-smoke',
    scenarioName: 'native usage smoke',
    inputTokens: 120_000,
    outputTokens: 45_000,
    cachedInputTokens: 30_000,
    reasoningTokens: 8_000,
  });
  assert(nativeResult.event.inputTokens === 120_000, 'native inputTokens mismatch');
  assert(nativeResult.event.outputTokens === 45_000, 'native outputTokens mismatch');

  const openAiStyleResult = await postUsage(usageUrl, {
    source: 'desktop-smoke-openai-style',
    usage: {
      prompt_tokens: 120_000,
      completion_tokens: 45_000,
      prompt_tokens_details: { cached_tokens: 30_000 },
      completion_tokens_details: { reasoning_tokens: 8_000 },
    },
  });
  assert(openAiStyleResult.event.inputTokens === 90_000, 'OpenAI-style cached tokens were not subtracted');
  assert(openAiStyleResult.event.cachedInputTokens === 30_000, 'OpenAI-style cachedInputTokens mismatch');

  const proxyResult = await fetchJson(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'smoke', messages: [] }),
  });
  assert(proxyResult.response.status === 409, 'disabled proxy should return 409 before provider setup');

  const deleteResult = await fetchJson(usageUrl, { method: 'DELETE' });
  assert(deleteResult.response.ok && deleteResult.json?.ok === true, 'DELETE /usage failed');

  const { json: finalHealth } = await fetchJson(`${baseUrl}/health`);
  assert(finalHealth.receivedUsageEvents === 0, 'DELETE /usage should reset receivedUsageEvents');

  console.log(
    JSON.stringify(
      {
        ok: true,
        target: isPackagedSmoke ? 'packaged-app' : 'electron-source',
        port,
        checks: [
          'GET /health',
          'POST /usage native',
          'POST /usage OpenAI-style cached subtraction',
          'POST /v1/chat/completions disabled-proxy guard',
          'DELETE /usage',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await stopChild();
}
